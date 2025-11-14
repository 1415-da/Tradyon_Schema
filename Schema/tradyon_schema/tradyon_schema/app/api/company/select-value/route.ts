import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function POST(request: NextRequest) {
  try {
    const { companyName, productName, categoryName, value } = await request.json();

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      return NextResponse.json(
        { error: 'Value must be a non-empty string' },
        { status: 400 }
      );
    }

    const normalizedCompanyName = companyName.trim().toLowerCase();
    const normalizedProductName = productName.trim();
    const normalizedCategoryName = categoryName.trim();
    const normalizedValue = value.trim();

    console.log('API select-value: Received company name:', normalizedCompanyName);
    console.log('API select-value: Product:', normalizedProductName);
    console.log('API select-value: Category:', normalizedCategoryName);
    console.log('API select-value: Value:', normalizedValue);

    let company = memoryStore.getCompany(normalizedCompanyName);

    // If company doesn't exist (server restart), try to recreate it
    if (!company) {
      console.log('API select-value: Company not found, attempting to recreate...');

      // Create the company with basic structure
      memoryStore.setCompany(normalizedCompanyName, {
        companyName: normalizedCompanyName,
        products: {}
      });

      company = memoryStore.getCompany(normalizedCompanyName);
      console.log('API select-value: Company recreated successfully');
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found and could not be recreated' },
        { status: 404 }
      );
    }

    // If product doesn't exist (server restart), create it
    if (!company.products[normalizedProductName]) {
      console.log('API select-value: Product not found, creating empty product...');
      company.products[normalizedProductName] = {
        categories: {}
      };
      // Update the memory store
      memoryStore.setCompany(normalizedCompanyName, company);
    }

    const product = company.products[normalizedProductName];
    let category = product.categories[normalizedCategoryName];

    // If category doesn't exist (server restart), create it with default options
    if (!category) {
      console.log('API select-value: Category not found, creating with default options...');

      // Get default options for known categories based on product
      const predefinedCategories: { [key: string]: { [key: string]: string[] } } = {
        'Cloves': {
          'Color': ['Red', 'Brown', 'Yellow', 'Black', 'White'],
          'Physical Form': ['Whole', 'Powder', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Indonesia', 'Tanzania', 'Madagascar', 'Sri Lanka'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Pepper': {
          'Color': ['Black', 'White', 'Green', 'Red'],
          'Physical Form': ['Whole', 'Ground', 'Crushed'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Vietnam', 'India', 'Brazil', 'Malaysia'],
          'Quality': ['Superior', 'Good', 'Fair'],
          'Type': ['Black Pepper', 'White Pepper', 'Green Pepper']
        },
        // Detailed clove sub-variety categories
        'Clove Buds': {
          'physical_form': [
            'Whole', 'Buds', 'Flowers', 'Crushed', 'Dried', 'Flower', 'Bud'
          ],
          'origin_country': [
            'United States', 'Indonesia', 'Comoros', 'China', 'Madagascar'
          ],
          'processing_method': [
            'Dried', 'Organic', 'Extracted', 'Raw', 'Unprocessed', 'Processed', 'Not Processed'
          ],
          'scientific_name': [
            'Caryophylli Flos', 'Syzygium Aromaticum', 'Eugenia Aromatica', 'Flos Syzygii Aromatici',
            'Syzygium Aromaticum Myrtaceae', 'Flos Caryophylli', 'Eugenia Caryophyllata'
          ],
          'packaging_type': [
            'Bag', 'Box', 'Pack', 'Bale'
          ],
          'intended_use': [
            'Tea', 'Spice', 'Medicinal Herbs', 'Raw Materials Of Traditional Chinese Medicine',
            'Food', 'Incense', 'Seasoning'
          ],
          'quality_grade': [
            'Grade A', 'Second Grade', 'FAQ'
          ]
        },
        'Clove Flowers': {
          'physical_form': [
            'Whole', 'Buds', 'Flowers', 'Crushed', 'Dried', 'Flower', 'Bud'
          ],
          'origin_country': [
            'United States', 'Indonesia', 'Comoros', 'China', 'Madagascar'
          ],
          'processing_method': [
            'Dried', 'Organic', 'Extracted', 'Raw', 'Unprocessed', 'Processed', 'Not Processed'
          ],
          'scientific_name': [
            'Caryophylli Flos', 'Syzygium Aromaticum', 'Eugenia Aromatica', 'Flos Syzygii Aromatici',
            'Syzygium Aromaticum Myrtaceae', 'Flos Caryophylli', 'Eugenia Caryophyllata'
          ],
          'packaging_type': [
            'Bag', 'Box', 'Pack', 'Bale'
          ],
          'intended_use': [
            'Tea', 'Spice', 'Medicinal Herbs', 'Raw Materials Of Traditional Chinese Medicine',
            'Food', 'Incense', 'Seasoning'
          ],
          'quality_grade': [
            'Grade A', 'Second Grade', 'FAQ'
          ]
        },
        'Clove Dust': {
          'physical_form': [
            'Dust', 'Fines'
          ],
          'origin_country': [
            'Indonesia'
          ],
          'packaging_type': [
            'Bag'
          ]
        },
        'Clove Husks': {
          'product_type': [
            'Clove Husks', 'Clove Pods', 'Clove Bark', 'Clove Shell'
          ],
          'physical_form': [
            'Unground', 'Dried'
          ],
          'packaging_type': [
            'Pp Bag', 'Bag', 'Bale'
          ]
        },
        'Clove Seeds': {
          'physical_form': [
            'Whole', 'Unground'
          ],
          'processing_method': [
            'Dried', 'Steam Sterilized'
          ],
          'origin_country': [
            'Indonesia'
          ],
          'packaging_type': [
            'Bag'
          ]
        },
        'Clove Stems': {
          'origin_country': [
            'Madagascar', 'Vietnam', 'Indonesia', 'Comoros', 'Sri Lanka', 'Zanzibar'
          ],
          'use': [
            'For Manufacturing Of Dhoop And Pooja Samagri', 'Food', 'For Industrial Use',
            'Spice Processing', 'Tea'
          ],
          'processing_method': [
            'Eto Treated', 'Dried', 'Cleaned', 'Sterilized', 'Germ Reduced', 'Unground'
          ],
          'physical_form': [
            'Stems', 'Stalks', 'Powder', 'Twig', 'With Oil', 'Broken', 'With Flowers',
            'Cut', 'Whole'
          ],
          'quality': [
            'Grade 1', 'Premium', 'Faq', 'Hps', 'Fancy', 'Extra', 'Standard'
          ],
          'crop_year': [
            '2025', '2019', '2024', '2023', '2022', '2021', '2020'
          ]
        },
        'Ground Cloves': {
          'physical_form': [
            'Ground', 'Powder', 'Whole', 'Crushed'
          ],
          'processing_method': [
            'Eto Treated', 'Eto Sterilized', 'Steam Sterilized', 'Steam Treated', 'Dried', 'Sterile Treated'
          ],
          'mesh_size': [
            'Mesh 18', 'Mesh 30', 'Mesh 40', 'Mesh 35', 'Mesh 25', 'Mesh 50', 'Mesh 60', '30 Mesh'
          ],
          'origin_country': [
            'Vietnam', 'Indonesia', 'Czech Republic'
          ],
          'quality_grade': [
            'Grinding Quality', 'Economy', 'Hand Picked Selection'
          ],
          'organic': [
            'Organic'
          ],
          'volatile_oil_content': [
            '14 Vo', '10% Vo', '15% Vo', '8% Vo', '3% Vo'
          ]
        },
        'Whole Cloves': {
          'origin_country': [
            'Indonesia', 'Madagascar', 'Comoros', 'Sri Lanka', 'Brazil', 'India', 'Vietnam',
            'United States', 'Pakistan', 'Zanzibar', 'Tanzania', 'All Origin', 'China', 'Seychelles'
          ],
          'physical_form': [
            'Whole', 'Long', 'Dried', 'Buds', 'Ground', 'Flower', 'Crushed', 'Uncrushed',
            'Unmilled', 'Rolls'
          ],
          'quality_grade': [
            'Cg3', 'Premium Quality', 'No 1', 'Bahia', 'Bahia Nr 1', 'Hps', 'Grade 1',
            'Bahia Nr. 1', 'Especial', 'Gourmet', 'Faq', 'Premium', 'Cleaned', 'Good Quality',
            'G1', 'Fancy', 'A Grade', 'Grade 2', 'Ab 6', 'Standard', 'Clean Grade A',
            'Food Grade', 'Aa Grade', 'Grinding Quality', 'Cg1', 'North Quality', 'Europe Extra',
            'Extra Gourmet', 'Grade A', 'Abs Grade', 'North Crop', 'Grade', 'Regular', 'B Grade',
            'Grinding Grade', 'Grade B', 'Clean Quality', 'Machine Cleaned', 'Grade I',
            'L-1mnmb Id 2017', 'Selected', 'Organic', 'Grade 4', 'Standard Quality'
          ],
          'processing_method': [
            'New Crop', 'Raw', 'Hps', 'Hand Picked', 'Steam Treated', 'Dried', 'Organic',
            'Cleaned', 'Steam', 'Eto', 'Eto Sterilized', 'Well Dried', 'Treated', 'Selected',
            'North Quality', 'North Crop', 'Steam Sterilized', 'Recleaned', 'Sterilized',
            'Uncrushed', 'Unprocessed', 'Preliminarily Processed', 'Unsliced', 'Unseasoned',
            'Machine Cleaned', 'Sieved', 'Sterile Treated', 'Oven Dried'
          ],
          'headless_percentage': [
            '15% Max Headless', '2% Max Headless', '10% Max Headless', '5% Max Headless'
          ],
          'volatile_oil_percentage': [
            '8% Vo', '16% Min V.o.', '17% Min V.o.'
          ],
          'mesh_size': [
            'Mesh 30'
          ],
          'variety': [
            'Lal Pari', 'Bahia', 'Bahiano', 'Gourmet', 'Regular', 'Forest', 'Reguler',
            'Manado', 'GORILLA', 'Hand Picked', 'Java', 'Zanzibar'
          ]
        },
        'Bell Pepper': {
          'Color': ['Green', 'Red', 'Yellow', 'Orange'],
          'Physical Form': ['Whole', 'Sliced', 'Diced'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['USA', 'Mexico', 'Netherlands', 'Spain'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Black Pepper': {
          'Color': ['Black', 'Dark Brown'],
          'Physical Form': ['Whole', 'Ground', 'Crushed'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Vietnam', 'India', 'Brazil', 'Malaysia'],
          'Quality': ['Superior', 'Good', 'Fair'],
          'Type': ['Black Pepper', 'White Pepper', 'Green Pepper']
        },
        'Cayenne Pepper': {
          'Color': ['Red', 'Orange', 'Brown'],
          'Physical Form': ['Whole', 'Ground', 'Flakes'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['India', 'China', 'Mexico', 'Peru'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Cubeb Pepper': {
          'Color': ['Brown', 'Dark Brown'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Indonesia', 'Malaysia', 'India'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Long Pepper': {
          'Color': ['Brown', 'Dark Brown'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Indonesia', 'India', 'Malaysia'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Pimento': {
          'Color': ['Red', 'Brown'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Jamaica', 'Mexico', 'Honduras'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        '0904 Pinhead Pepper': {
          'Color': ['Black', 'Dark Brown'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Vietnam', 'India', 'Brazil'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Pink Pepper': {
          'Color': ['Pink', 'Red'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Brazil', 'Peru', 'Madagascar'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Red Chilli': {
          'Color': ['Red', 'Orange', 'Brown'],
          'Physical Form': ['Whole', 'Ground', 'Flakes'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['India', 'China', 'Thailand', 'Vietnam'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'Sichuan Pepper': {
          'Color': ['Brown', 'Red'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['China', 'Tibet', 'Sichuan Province'],
          'Quality': ['Superior', 'Good', 'Fair']
        },
        'White Pepper': {
          'Color': ['White', 'Cream'],
          'Physical Form': ['Whole', 'Ground'],
          'Size': ['Small', 'Medium', 'Large', 'Extra Large'],
          'Grade': ['Premium', 'Standard', 'Commercial', 'Organic'],
          'Origin': ['Vietnam', 'India', 'Brazil', 'Malaysia'],
          'Quality': ['Superior', 'Good', 'Fair']
        }
      };

      const productCategories = predefinedCategories[normalizedProductName] || {};
      const defaultOptions = productCategories[normalizedCategoryName] || [];

      category = {
        options: defaultOptions,
        selectedValues: []
      };

      product.categories[normalizedCategoryName] = category;
      // Update the memory store
      memoryStore.setCompany(normalizedCompanyName, company);
    }

    // If the value is not in the options list, add it (handles custom options)
    if (!category.options.includes(normalizedValue)) {
      console.log('API select-value: Option not found in category, adding it...');
      category.options.push(normalizedValue);
      // Update the memory store
      memoryStore.setCompany(normalizedCompanyName, company);
    }

    // Toggle selected value in array
    const currentSelectedValues = category.selectedValues || [];
    const isSelected = currentSelectedValues.includes(normalizedValue);
    const newSelectedValues = isSelected
      ? currentSelectedValues.filter(v => v !== normalizedValue)
      : [...currentSelectedValues, normalizedValue];

    // Update selected values
    const success = memoryStore.updateCompany(normalizedCompanyName, (data) => ({
      ...data,
      products: {
        ...data.products,
        [normalizedProductName]: {
          categories: {
            ...data.products[normalizedProductName].categories,
            [normalizedCategoryName]: {
              options: category.options,
              selectedValues: newSelectedValues
            }
          }
        }
      }
    }));

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update selected values' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      selectedValues: newSelectedValues
    });

  } catch (error) {
    console.error('Error updating selected values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
