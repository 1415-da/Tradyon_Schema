'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/companyStore';

export default function ProductSelector() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProduct, setCustomProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [addingCustomVarietyTo, setAddingCustomVarietyTo] = useState<string | null>(null);
  const [newCustomVariety, setNewCustomVariety] = useState('');
  const [addingCustomOptionTo, setAddingCustomOptionTo] = useState<string | null>(null);
  const [newCustomOption, setNewCustomOption] = useState('');
  const [customVarieties, setCustomVarieties] = useState<{[productName: string]: string[]}>({});
  const router = useRouter();

  const companyData = useCompanyStore((state) => state.companyData);
  const predefinedProducts = useCompanyStore((state) => state.predefinedProducts);
  const productSubVarieties = useCompanyStore((state) => state.productSubVarieties);
  const existingProducts = useCompanyStore((state) => state.productList);
  const addProduct = useCompanyStore((state) => state.addProduct);

  useEffect(() => {
    if (!companyData) {
      router.push('/');
    }
  }, [companyData, router]);

  if (!companyData) {
    return null;
  }

  const handleProductToggle = (productName: string) => {
    setSelectedProducts(prev =>
      prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  const toggleProductExpansion = (productName: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productName)) {
        newSet.delete(productName);
      } else {
        newSet.add(productName);
      }
      return newSet;
    });
  };

  const handleSubVarietyToggle = (subVariety: string) => {
    setSelectedProducts(prev =>
      prev.includes(subVariety)
        ? prev.filter(p => p !== subVariety)
        : [...prev, subVariety]
    );
  };

  const handleAddCustomVariety = async (productCategory: string) => {
    if (!newCustomVariety.trim()) return;

    const varietyName = newCustomVariety.trim();

    // Check if already exists in predefined varieties
    const subVarieties = productSubVarieties[productCategory] || [];
    if (subVarieties.includes(varietyName)) {
      setError('This variety already exists in predefined varieties');
      return;
    }

    // Check if already exists in custom varieties for this product
    const existingCustomVarieties = customVarieties[productCategory] || [];
    if (existingCustomVarieties.includes(varietyName)) {
      setError('This custom variety already exists');
      return;
    }

    // Add to custom varieties for this product
    setCustomVarieties(prev => ({
      ...prev,
      [productCategory]: [...(prev[productCategory] || []), varietyName]
    }));

    // Also add to selected products so it gets selected
    setSelectedProducts(prev => [...prev, varietyName]);

    // Reset form
    setNewCustomVariety('');
    setAddingCustomVarietyTo(null);
  };

  const handleAddCustomOption = async (customProduct: string) => {
    if (!newCustomOption.trim()) return;

    const optionName = newCustomOption.trim();

    // For now, we'll just add the custom product with the option name as part of it
    // This is a simplified approach - in a real app, you'd store options separately
    const productWithOption = `${customProduct} (${optionName})`;

    if (existingProducts.includes(productWithOption)) {
      setError('Product with this option already exists');
      return;
    }

    if (selectedProducts.includes(productWithOption)) {
      setError('Product with this option already selected');
      return;
    }

    // Add to selected products
    setSelectedProducts(prev => [...prev, productWithOption]);

    // Reset form
    setNewCustomOption('');
    setAddingCustomOptionTo(null);
  };

  const handleAddCustomProduct = async () => {
    if (!customProduct.trim()) return;

    const productName = customProduct.trim();

    if (existingProducts.includes(productName)) {
      setError('Product already exists');
      return;
    }

    if (selectedProducts.includes(productName)) {
      setError('Product already selected');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/company/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      // Update local store after successful API call
      addProduct(data.productName);

      setSelectedProducts(prev => [...prev, productName]);
      setCustomProduct('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Add all selected predefined products that aren't already added
      const productsToAdd = selectedProducts.filter(p => !existingProducts.includes(p));

      for (const productName of productsToAdd) {
        const response = await fetch('/api/company/add-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: companyData.companyName,
            productName
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to add ${productName}`);
        }

        // Update local store after successful API call
        addProduct(productName);
      }

      // Navigate to the bulk configuration page
      router.push('/products/configure');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Product Varieties for {companyData.companyName}
        </h2>
        <p className="text-gray-600">
          Choose specific product varieties from Cloves and Pepper categories, or add custom products. Each selected variety will become a separate sheet in your Google Sheets export with its own categories and specifications.
        </p>
      </div>

      {/* All Product Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
        <div className="space-y-4">
          {/* Predefined Product Categories */}
          {predefinedProducts.map((product) => {
            const isExpanded = expandedProducts.has(product);
            const subVarieties = productSubVarieties[product] || [];
            const productCustomVarieties = customVarieties[product] || [];
            const allVarieties = [...subVarieties, ...productCustomVarieties];
            // Count all varieties for this predefined product (predefined + custom varieties)
            const selectedCount = selectedProducts.filter(p =>
              allVarieties.includes(p)
            ).length;

            return (
              <div key={product} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Product Header */}
                <div
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleProductExpansion(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg
                          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span className="font-semibold text-gray-900">{product}</span>
                      {selectedCount > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          ({selectedCount} selected)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Predefined Sub-Varieties */}
                {isExpanded && (
                  <div className="bg-white p-4 border-t border-gray-200">
                    {/* All Varieties Grid (Predefined + Custom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {allVarieties.map((variety) => {
                        const isSelected = selectedProducts.includes(variety);
                        const isExisting = existingProducts.includes(variety);
                        const isCustom = productCustomVarieties.includes(variety);

                        return (
                          <div
                            key={variety}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors relative ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : isExisting
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => !isExisting && handleSubVarietyToggle(variety)}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : isExisting ? 'text-green-700' : 'text-gray-900'}`}>
                                {variety}
                              </span>
                              <div className="flex items-center space-x-1">
                                {isCustom && (
                                  <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {isSelected && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {isExisting && !isSelected && (
                                  <span className="text-xs text-green-600 font-medium">Added</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Variety */}
                    <div className="border-t border-gray-200 pt-4">
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Add Custom Variety</h6>
                      {addingCustomVarietyTo === product ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCustomVariety}
                            onChange={(e) => setNewCustomVariety(e.target.value)}
                            placeholder={`Enter custom ${product.toLowerCase()} variety`}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomVariety(product);
                              } else if (e.key === 'Escape') {
                                setAddingCustomVarietyTo(null);
                                setNewCustomVariety('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddCustomVariety(product)}
                            disabled={!newCustomVariety.trim()}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddingCustomVarietyTo(null);
                              setNewCustomVariety('');
                            }}
                            className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingCustomVarietyTo(product)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Custom Variety</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Product Categories */}
          {selectedProducts
            .filter(product => !predefinedProducts.some(p => productSubVarieties[p]?.includes(product)))
            .filter(product => !product.includes(' (')) // Filter out products that already have options
            .filter(product => {
              // Filter out custom varieties that belong to predefined products
              const allCustomVarieties = Object.values(customVarieties).flat();
              return !allCustomVarieties.includes(product);
            })
            .map(product => {
              const isExpanded = expandedProducts.has(product);
              const productOptions = selectedProducts.filter(p => p.startsWith(`${product} (`));
              const selectedCount = productOptions.length;

              return (
                <div key={product} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Product Header */}
                  <div
                    className="bg-orange-50 p-4 cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => toggleProductExpansion(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-500 hover:text-gray-700">
                          <svg
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <span className="font-semibold text-gray-900">{product}</span>
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {selectedCount > 0 && (
                          <span className="text-sm text-blue-600 font-medium">
                            ({selectedCount} option{selectedCount !== 1 ? 's' : ''})
                          </span>
                        )}
                        <button
                          onClick={() => handleProductToggle(product)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Options */}
                  {isExpanded && (
                    <div className="bg-white p-4 border-t border-gray-200">
                      {/* Existing Options */}
                      {productOptions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {productOptions.map(option => {
                            const optionName = option.replace(`${product} (`, '').replace(')', '');
                            return (
                              <div
                                key={option}
                                className="border border-orange-200 bg-orange-50 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-orange-800">
                                    {optionName}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <button
                                      onClick={() => handleProductToggle(option)}
                                      className="text-orange-600 hover:text-orange-800"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Custom Option */}
                      <div className="border-t border-gray-200 pt-4">
                        <h6 className="text-xs font-medium text-gray-600 mb-2">Add Custom Option</h6>
                        {addingCustomOptionTo === product ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newCustomOption}
                              onChange={(e) => setNewCustomOption(e.target.value)}
                              placeholder={`Enter custom ${product.toLowerCase()} option`}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddCustomOption(product);
                                } else if (e.key === 'Escape') {
                                  setAddingCustomOptionTo(null);
                                  setNewCustomOption('');
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddCustomOption(product)}
                              disabled={!newCustomOption.trim()}
                              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setAddingCustomOptionTo(null);
                                setNewCustomOption('');
                              }}
                              className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingCustomOptionTo(product)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Custom Option</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Custom Product */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Product</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customProduct}
            onChange={(e) => setCustomProduct(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomProduct()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            placeholder="Enter custom product name"
            disabled={isLoading}
          />
          <button
            onClick={handleAddCustomProduct}
            disabled={!customProduct.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selected Products ({selectedProducts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <span
                key={product}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {product}
                <button
                  onClick={() => handleProductToggle(product)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          disabled={selectedProducts.length === 0 || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : `Continue with ${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
