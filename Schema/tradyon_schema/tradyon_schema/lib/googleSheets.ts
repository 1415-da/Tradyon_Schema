import { google } from 'googleapis';
import { CompanyData } from './store/companyStore';

export class GoogleSheetsService {
  private auth: any;
  private sheets: any;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async createCompanySpreadsheet(companyData: CompanyData): Promise<string> {
    try {
      // Create a new spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${companyData.companyName} - Product Specifications`,
          },
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

      if (!spreadsheetId) {
        throw new Error('Failed to create spreadsheet');
      }

      // Create sheets for each product
      const productNames = Object.keys(companyData.products);
      const requests = [];

      // Add requests to create additional sheets (first sheet is created by default)
      for (let i = 1; i < productNames.length; i++) {
        requests.push({
          addSheet: {
            properties: {
              title: productNames[i],
            },
          },
        });
      }

      // Rename the first sheet to the first product
      if (productNames.length > 0) {
        requests.push({
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: productNames[0],
            },
            fields: 'title',
          },
        });
      }

      if (requests.length > 0) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests,
          },
        });
      }

      // Populate each sheet with data
      for (const productName of productNames) {
        await this.populateProductSheet(spreadsheetId, productName, companyData.products[productName]);
      }

      return spreadsheetUrl || '';

    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw new Error('Failed to create Google Sheets spreadsheet');
    }
  }

  private async populateProductSheet(
    spreadsheetId: string,
    productName: string,
    productData: CompanyData['products'][string]
  ) {
    try {
      // Get sheet ID for the product
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === productName);
      if (!sheet) {
        throw new Error(`Sheet not found for product: ${productName}`);
      }

      const sheetId = sheet.properties?.sheetId;
      const categories = Object.keys(productData.categories);

      if (categories.length === 0) {
        // If no categories, just write the product name
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${productName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[productName]],
          },
        });
        return;
      }

      // Prepare data: Category | Selected Values | Available Options
      const headerRow = ['Category', 'Selected Values', 'Available Options'];
      const dataRows: any[][] = [headerRow];

      for (const categoryName of categories) {
        const category = productData.categories[categoryName];
        const selectedValues = category.selectedValues || [];
        const selectedValuesString = selectedValues.length > 0 ? selectedValues.join(', ') : 'Not selected';
        const optionsString = category.options.join(', ');

        dataRows.push([categoryName, selectedValuesString, optionsString]);
      }

      // Write data to the sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${productName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: dataRows,
        },
      });

      // Format the header row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 3,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.2,
                      green: 0.6,
                      blue: 0.9,
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 1.0,
                        green: 1.0,
                        blue: 1.0,
                      },
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 3,
                },
              },
            },
          ],
        },
      });

    } catch (error) {
      console.error(`Error populating sheet for ${productName}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to get the service account's email to verify authentication
      const authClient = await this.auth.getClient();
      const credentials = await authClient.getAccessToken();

      if (credentials.token) {
        console.log('Google Sheets API authentication successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Google Sheets API authentication failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();
