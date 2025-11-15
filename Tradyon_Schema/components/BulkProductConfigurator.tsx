'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/companyStore';

export default function BulkProductConfigurator() {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [addingOptionTo, setAddingOptionTo] = useState<string | null>(null);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [addingCategoryTo, setAddingCategoryTo] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fullState = useCompanyStore();
  const companyData = fullState.companyData;
  const productList = fullState.productList;
  const categoryList = fullState.categoryList;
  const predefinedCategories = fullState.predefinedCategories;
  const addCategory = fullState.addCategory;
  const setSelectedValue = fullState.setSelectedValue;

  useEffect(() => {
    if (!companyData) {
      router.push('/');
    }
  }, [companyData, router]);

  if (!companyData) return null;

  const toggleProductExpansion = (productName: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      newSet.has(productName) ? newSet.delete(productName) : newSet.add(productName);
      return newSet;
    });
  };

  const startEditingProduct = (productName: string) => {
    setEditingProduct(productName);
    setEditingName(productName);
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
    setEditingName('');
  };

  const saveProductName = () => {
    if (!editingProduct || !editingName.trim()) return;
    console.log(`Renaming ${editingProduct} → ${editingName.trim()}`);
    setEditingProduct(null);
    setEditingName('');
  };

  const handleAddCategory = async (productName: string, categoryName: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');

      addCategory(productName, categoryName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectValue = async (productName: string, categoryName: string, value: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/select-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
          value
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to select value');

      setSelectedValue(productName, categoryName, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error selecting value');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomCategory = async (productName: string) => {
    if (!newCategoryName.trim()) return;
    const categoryName = newCategoryName.trim();

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');

      addCategory(productName, categoryName);
      setAddingCategoryTo(null);
      setNewCategoryName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = async (productName: string, categoryName: string) => {
    if (!newOptionValue.trim()) return;
    const optionValue = newOptionValue.trim();

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/add-option', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
          option: optionValue
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add option');

      useCompanyStore.getState().addOption(productName, categoryName, optionValue);
      setAddingOptionTo(null);
      setNewOptionValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding option');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => router.push('/review');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Step Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Step 2: Product Configuration
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Configure
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Products</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Set up detailed specifications for <span className="font-semibold text-gray-900">{companyData.companyName}</span>.
          </p>
        </div>

        {/* BOX CONTAINER */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {productList.map(productName => {
              const productCategories = categoryList[productName] || [];
              const isExpanded = expandedProducts.has(productName);

              return (
                <div key={productName} className="border rounded-xl shadow-md bg-white">

                  {/* Header */}
                  <div className="bg-blue-50 p-4 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleProductExpansion(productName)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <svg
                          className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {editingProduct === productName ? (
                        <div className="flex items-center space-x-2">
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border px-2 py-1 rounded text-gray-900 placeholder-gray-500"
                            placeholder="Enter new name"
                            autoFocus
                          />
                          <button onClick={saveProductName} className="text-green-600">Save</button>
                          <button onClick={cancelEditingProduct} className="text-gray-600">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{productName}</h3>
                          <button onClick={() => startEditingProduct(productName)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-sm text-gray-500">{productCategories.length} categories</span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50 border-t">
                      {/* Add Categories */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Add Categories</h5>

                        {/* Predefined Categories */}
                        <div className="mb-4">
                          <h6 className="text-xs font-medium text-gray-600 mb-2">Available Categories for {productName}</h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {/* Product-specific Predefined Categories */}
                            {predefinedCategories[productName] && Object.keys(predefinedCategories[productName]).map((categoryName) => {
                              const isAlreadyAdded = productCategories.includes(categoryName);
                              return (
                                <button
                                  key={categoryName}
                                  onClick={() => !isAlreadyAdded && handleAddCategory(productName, categoryName)}
                                  disabled={isAlreadyAdded || isLoading}
                                  className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                    isAlreadyAdded
                                      ? 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed'
                                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                  }`}
                                >
                                  {categoryName}
                                  {isAlreadyAdded && (
                                    <span className="ml-1 text-xs">✓</span>
                                  )}
                                </button>
                              );
                            })}
                            {/* Custom Categories Added to This Product */}
                            {productCategories
                              .filter(categoryName => !predefinedCategories[productName] || !Object.keys(predefinedCategories[productName]).includes(categoryName))
                              .map((categoryName) => (
                                <button
                                  key={categoryName}
                                  disabled={true}
                                  className="px-3 py-2 text-sm border rounded-md bg-purple-100 border-purple-300 text-purple-800 cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {categoryName}
                                </button>
                              ))}
                          </div>
                        </div>

                        {/* Add Custom Category */}
                        <div>
                          <h6 className="text-xs font-medium text-gray-600 mb-2">Custom Category</h6>
                          {addingCategoryTo === productName ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter new category name"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddCustomCategory(productName);
                                  } else if (e.key === 'Escape') {
                                    setAddingCategoryTo(null);
                                    setNewCategoryName('');
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddCustomCategory(productName)}
                                disabled={!newCategoryName.trim() || isLoading}
                                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setAddingCategoryTo(null);
                                  setNewCategoryName('');
                                }}
                                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingCategoryTo(productName)}
                              disabled={isLoading}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Add Custom Category</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Configure Categories */}
                      {productCategories.length > 0 && (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Configure Categories</h5>
                          <div className="space-y-3">
                            {productCategories.map((categoryName) => {
                              // Get data from fullState to ensure re-renders
                              const selectedValues = fullState.companyData?.products[productName]?.categories[categoryName]?.selectedValues || [];
                              const options = fullState.companyData?.products[productName]?.categories[categoryName]?.options || [];

                              return (
                                <div key={categoryName} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 text-sm">{categoryName}</span>
                                    {selectedValues.length > 0 && (
                                      <span className="text-xs text-green-600 font-medium">
                                        Selected: {selectedValues.length} option{selectedValues.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {options.map((option) => {
                                      const isSelected = selectedValues.includes(option);
                                      return (
                                        <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSelectValue(productName, categoryName, option)}
                                            disabled={isLoading}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                          />
                                          <span className={`text-sm ${isSelected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                                            {option}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>

                                  {/* Add Custom Option */}
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    {addingOptionTo === `${productName}-${categoryName}` ? (
                                      <div className="flex space-x-2">
                                        <input
                                          type="text"
                                          value={newOptionValue}
                                          onChange={(e) => setNewOptionValue(e.target.value)}
                                          placeholder="Enter new option"
                                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleAddOption(productName, categoryName);
                                            } else if (e.key === 'Escape') {
                                              setAddingOptionTo(null);
                                              setNewOptionValue('');
                                            }
                                          }}
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => handleAddOption(productName, categoryName)}
                                          disabled={!newOptionValue.trim() || isLoading}
                                          className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Add
                                        </button>
                                        <button
                                          onClick={() => {
                                            setAddingOptionTo(null);
                                            setNewOptionValue('');
                                          }}
                                          className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setAddingOptionTo(`${productName}-${categoryName}`)}
                                        disabled={isLoading}
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Add Custom Option</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {productList.length > 0 && (
            <div className="mt-8 flex justify-between">
              <button onClick={() => router.push('/products')} className="text-gray-700">
                ← Back
              </button>
              <button onClick={handleContinue} className="bg-blue-600 text-white px-6 py-2 rounded-md">
                Review & Export
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
