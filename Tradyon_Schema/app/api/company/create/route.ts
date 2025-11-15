import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { CompanyData } from '@/lib/store/companyStore';

export async function POST(request: NextRequest) {
  try {
    const { companyName, contactPerson } = await request.json();

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!contactPerson || typeof contactPerson !== 'string' || contactPerson.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contact person is required' },
        { status: 400 }
      );
    }

    const normalizedName = companyName.trim().toLowerCase();
    const normalizedContactPerson = contactPerson.trim();

    console.log('Create API: === CREATING COMPANY ===');
    console.log('Create API: Received companyName:', JSON.stringify(companyName));
    console.log('Create API: Normalized companyName:', JSON.stringify(normalizedName));
    console.log('Create API: Will store with key:', JSON.stringify(normalizedName));

    // Check if company already exists
    const existingCompany = memoryStore.getCompany(normalizedName);
    if (existingCompany) {
      console.log('Create API: Company already exists');
      return NextResponse.json(
        { error: 'Company already exists' },
        { status: 409 }
      );
    }

    // Create new company data
    const companyData: CompanyData = {
      companyName: normalizedName,
      contactPerson: normalizedContactPerson,
      products: {}
    };

    console.log('Create API: Storing company data:', {
      companyName: companyData.companyName,
      contactPerson: companyData.contactPerson
    });

    memoryStore.setCompany(normalizedName, companyData);
    console.log('Create API: Company stored successfully. Total companies:', memoryStore['companies'].size);

    console.log('Create API: Returning response with companyName:', normalizedName);
    return NextResponse.json({
      success: true,
      companyName: normalizedName,
      contactPerson: normalizedContactPerson
    });

  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
