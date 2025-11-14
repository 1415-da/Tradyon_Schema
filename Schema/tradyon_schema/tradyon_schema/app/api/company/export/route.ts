import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { googleSheetsService } from '@/lib/googleSheets';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const normalizedCompanyName = companyName.trim().toLowerCase();
    console.log('Export API: Received companyName:', JSON.stringify(companyName));
    console.log('Export API: Normalized companyName:', JSON.stringify(normalizedCompanyName));
    console.log('Export API: Memory store companies:', Array.from(memoryStore['companies'].keys()));

    let company = memoryStore.getCompany(normalizedCompanyName);
    console.log('Export API: Company found with normalized name:', !!company);

    // If not found, try with original casing
    if (!company) {
      company = memoryStore.getCompany(companyName.trim());
      console.log('Export API: Company found with original casing:', !!company);
    }

    // If still not found, this is likely a development server restart issue
    if (!company) {
      console.log('Export API: === COMPANY NOT FOUND ===');
      console.log('Export API: Searched for:', normalizedCompanyName);
      console.log('Export API: Also tried:', companyName.trim());
      console.log('Export API: Available companies:', Array.from(memoryStore['companies'].keys()));
      return NextResponse.json(
        {
          error: 'Company data not found. This can happen in development when the server restarts. Please go back to the home page and start the process again.',
          details: 'Development server restart detected - in-memory data was lost'
        },
        { status: 404 }
      );
    }

    console.log('Export API: Company name from store:', company.companyName);

    // Validate that company has products
    const productNames = Object.keys(company.products);
    if (productNames.length === 0) {
      return NextResponse.json(
        { error: 'Company must have at least one product to export' },
        { status: 400 }
      );
    }

    // Create output folder if it doesn't exist
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Prepare JSON data with all company details
    const jsonData: {
      companyName: string;
      contactPerson: string;
      exportDate: string;
      productCount: number;
      products: { [key: string]: any };
    } = {
      companyName: company.companyName,
      contactPerson: company.contactPerson || 'Not provided',
      exportDate: new Date().toISOString(),
      productCount: productNames.length,
      products: {}
    };

    // Process each product and its details
    productNames.forEach(productName => {
      const product = company.products[productName];
      const categories: { [key: string]: { options: string[]; selectedValues: string[] } } = {};

      Object.keys(product.categories).forEach(categoryName => {
        const category = product.categories[categoryName];
        categories[categoryName] = {
          options: category.options,
          selectedValues: category.selectedValues || []
        };
      });

      jsonData.products[productName] = {
        categories: categories,
        categoryCount: Object.keys(categories).length,
        totalOptions: Object.values(categories).reduce((sum, cat: any) => sum + cat.options.length, 0),
        totalSelectedValues: Object.values(categories).reduce((sum, cat: any) => sum + (cat.selectedValues?.length || 0), 0)
      };
    });

    // Create JSON filename (sanitize company name for filesystem)
    const sanitizedCompanyName = company.companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const jsonFileName = `${sanitizedCompanyName}.json`;
    const jsonFilePath = path.join(outputDir, jsonFileName);

    // Write JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log('Export API: JSON file created successfully at:', jsonFilePath);
    console.log('Export API: JSON data summary:', {
      companyName: jsonData.companyName,
      contactPerson: jsonData.contactPerson,
      productCount: jsonData.productCount,
      products: Object.keys(jsonData.products)
    });

    // Create Google Sheets spreadsheet
    const sheetUrl = await googleSheetsService.createCompanySpreadsheet(company);

    return NextResponse.json({
      success: true,
      sheetUrl,
      jsonFilePath: `output/${jsonFileName}`,
      jsonFileName: jsonFileName,
      companyName: normalizedCompanyName,
      contactPerson: company.contactPerson || 'Not provided',
      productCount: productNames.length,
      exportTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to create Google Sheets spreadsheet' },
      { status: 500 }
    );
  }
}
