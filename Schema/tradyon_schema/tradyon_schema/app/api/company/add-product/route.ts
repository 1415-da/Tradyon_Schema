import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function POST(request: NextRequest) {
  try {
    const { companyName, productName } = await request.json();

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

    const normalizedCompanyName = companyName.trim().toLowerCase();
    const normalizedProductName = productName.trim();

    console.log('Add Product API: Received companyName:', JSON.stringify(companyName));
    console.log('Add Product API: Normalized companyName:', JSON.stringify(normalizedCompanyName));

    let company = memoryStore.getCompany(normalizedCompanyName);

    // If company doesn't exist (server restart), recreate it
    if (!company) {
      console.log('API add-product: Company not found, recreating...');
      memoryStore.setCompany(normalizedCompanyName, {
        companyName: normalizedCompanyName,
        products: {}
      });
      company = memoryStore.getCompany(normalizedCompanyName);
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found and could not be recreated' },
        { status: 404 }
      );
    }

    // Check if product already exists
    if (company.products[normalizedProductName]) {
      return NextResponse.json(
        { error: 'Product already exists for this company' },
        { status: 409 }
      );
    }

    // Add product to company
    const success = memoryStore.updateCompany(normalizedCompanyName, (data) => ({
      ...data,
      products: {
        ...data.products,
        [normalizedProductName]: {
          categories: {}
        }
      }
    }));

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productName: normalizedProductName
    });

  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
