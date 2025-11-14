'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/companyStore';

interface CategoryEditorProps {
  productName: string;
}

export default function CategoryEditor({ productName }: CategoryEditorProps) {
  const router = useRouter();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const companyData = useCompanyStore((state) => state.companyData);
  const predefinedCategories = useCompanyStore((state) => state.predefinedCategories);
  const categoryList = useCompanyStore((state) => state.categoryList[productName] || []);
  const optionList = useCompanyStore((state) => state.optionList);

  const addCategory = useCompanyStore((state) => state.addCategory);

  /* -----------------------------------------
      Init categoryList + optionList structure
     ----------------------------------------- */
  useEffect(() => {
    if (!companyData) {
      router.push('/');
      return;
    }

    const currentState = useCompanyStore.getState();
    const updates: any = {};

    // Ensure the product has a category list entry
    if (!currentState.categoryList[productName]) {
      updates.categoryList = {
        ...currentState.categoryList,
        [productName]: [],
      };
    }

    // Ensure optionList entries for existing categories
    const existingCats = currentState.companyData?.products[productName]?.categories;

    if (existingCats) {
      const optionUpdates: any = {};

      Object.keys(existingCats).forEach((categoryName) => {
        const optionKey = `${productName}-${categoryName}`;

        if (!currentState.optionList[optionKey]) {
          optionUpdates[optionKey] = existingCats[categoryName].options || [];
        }
      });

      if (Object.keys(optionUpdates).length > 0) {
        updates.optionList = {
          ...currentState.optionList,
          ...optionUpdates,
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      useCompanyStore.setState((state) => ({
        ...state,
        ...updates,
      }));
    }
  }, [companyData, router, productName]);

  if (!companyData) return null;

  const currentCategories = categoryList;

  /* -----------------------------------------
      Add Predefined Category
     ----------------------------------------- */
  const handleAddPredefinedCategory = async (categoryName: string) => {
    if (currentCategories.includes(categoryName)) {
      setError('Category already exists for this product');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/company/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addCategory(productName, categoryName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
      Add Custom Category
     ----------------------------------------- */
  const handleAddCustomCategory = async () => {
    if (!newCategoryName.trim()) return;

    const categoryName = newCategoryName.trim();

    if (currentCategories.includes(categoryName)) {
      setError('Category already exists for this product');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/company/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addCategory(productName, categoryName);
      setNewCategoryName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /* -----------------------------------------
      Handle select value
     ----------------------------------------- */
  const handleSelectValue = async (categoryName: string, value: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/company/select-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
          value,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      useCompanyStore.getState().setSelectedValue(productName, categoryName, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableCategories = () => {
    const productCategories = predefinedCategories[productName] || {};
    return Object.keys(productCategories).filter((cat) => !currentCategories.includes(cat));
  };

  /* -----------------------------------------
     UI RENDER
     ----------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configure {productName}
        </h2>
        <p className="text-gray-600">
          Add categories and select values for this product. Each category will
          become a row in your Google Sheets export.
        </p>
      </div>

      {/* Predefined Categories */}
      {getAvailableCategories().length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Predefined Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAvailableCategories().map((categoryName) => (
              <div key={categoryName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{categoryName}</h4>
                  <button
                    onClick={() => handleAddPredefinedCategory(categoryName)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Options: {(predefinedCategories[productName] && predefinedCategories[productName][categoryName] || []).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Category */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Add Custom Category</h3>
        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
            disabled={isLoading}
            placeholder="Enter custom category name"
            className="flex-1 px-3 py-2 border rounded-md text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={handleAddCustomCategory}
            disabled={!newCategoryName.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Existing Categories */}
      {currentCategories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Categories ({currentCategories.length})
          </h3>
          <div className="space-y-4">
            {currentCategories.map((categoryName: string) => {
              const optionKey = `${productName}-${categoryName}`;
              const selectedValues =
                companyData.products[productName]?.categories[categoryName]
                  ?.selectedValues;

              return (
                <div key={categoryName} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <h4 className="font-medium">{categoryName}</h4>
                    <span className="text-sm text-gray-500">
                      {selectedValues && selectedValues.length > 0 ? `Selected (${selectedValues.length})` : 'Not selected'}
                    </span>
                  </div>

                  <DropdownEditor
                    productName={productName}
                    categoryName={categoryName}
                    options={optionList[optionKey] || []}
                    selectedValues={selectedValues}
                    onSelectValue={handleSelectValue}
                    disabled={isLoading}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/products')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Products
        </button>

        <button
          onClick={() => router.push('/review')}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Review & Export
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------
   DROPDOWN EDITOR COMPONENT
   ----------------------------------------- */

interface DropdownEditorProps {
  productName: string;
  categoryName: string;
  options: string[];
  selectedValues?: string[];
  onSelectValue: (categoryName: string, value: string) => void;
  disabled?: boolean;
}

function DropdownEditor({
  productName,
  categoryName,
  options,
  selectedValues,
  onSelectValue,
  disabled = false,
}: DropdownEditorProps) {
  const [newOption, setNewOption] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);

  const handleAddOption = async () => {
    if (!newOption.trim()) return;

    const optionValue = newOption.trim();

    if (options.includes(optionValue)) return;

    setIsAddingOption(true);

    try {
      const companyData = useCompanyStore.getState().companyData;
      if (!companyData) return;

      const response = await fetch('/api/company/add-option', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          productName,
          categoryName,
          option: optionValue,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      useCompanyStore.getState().addOption(productName, categoryName, optionValue);
      setNewOption('');
    } catch (err) {
      console.error('Error adding option:', err);
    } finally {
      setIsAddingOption(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Select Values */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Values (Multiple)</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {options.map((option: string) => {
            const isSelected = selectedValues?.includes(option) || false;
            return (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onSelectValue(categoryName, option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${isSelected ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Display Options */}
      <div>
        <label className="block text-sm font-medium mb-1">Available Options</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {options.map((option: string) => (
            <span
              key={option}
              className={`px-2 py-1 rounded text-sm ${
                selectedValues?.includes(option)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {option}
            </span>
          ))}
        </div>

        {/* Add New Option */}
        <div className="flex gap-2">
          <input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
            placeholder="Add new option"
            disabled={isAddingOption}
            className="flex-1 px-2 py-1 border rounded text-sm text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={handleAddOption}
            disabled={!newOption.trim() || isAddingOption}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded disabled:opacity-50"
          >
            {isAddingOption ? '...' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}
