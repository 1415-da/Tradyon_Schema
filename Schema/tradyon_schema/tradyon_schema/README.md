# Product Specification System

A fullstack Next.js application that allows companies to create detailed product specifications and export them directly to Google Sheets. Each company gets its own isolated workspace with customizable categories and options.

## 🚀 Features

- **Company Isolation**: Each company has its own separate workspace
- **Product Management**: Select from predefined products or add custom ones
- **Category Customization**: Add predefined or custom categories for each product
- **Option Management**: Configure dropdown options for each category
- **Google Sheets Export**: Automatic creation of spreadsheets with each product as a separate sheet
- **Vercel Deployment**: Production-ready for Vercel hosting
- **Responsive Design**: Works on all devices with Tailwind CSS

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (no separate server)
- **State Management**: Zustand for client-side state
- **Storage**: In-memory (resets on server restart)
- **Export**: Google Sheets API v4
- **Deployment**: Vercel

## 📋 Workflow

1. **Enter Company Name** → Creates isolated workspace
2. **Select Products** → Choose from predefined or add custom products
3. **Configure Categories** → Add categories and options for each product
4. **Review & Export** → Preview data and export to Google Sheets
5. **Success** → Access your generated spreadsheet

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Project with Google Sheets API enabled
- Service Account with Google Sheets permissions

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd tradyon_schema
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables (see Environment Variables section below)

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

### Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create new service account
   - Grant "Editor" role
   - Create JSON key and download

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Sheets API Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
```

**Important Notes:**
- The `GOOGLE_PRIVATE_KEY` must include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` headers
- Use `\n` for line breaks in the private key
- Never commit `.env.local` to version control

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all Google Sheets variables listed above
   - Set environment to "Production"

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js

2. **Configure Environment Variables:**
   - Add all required Google API credentials
   - Ensure private key formatting is correct

3. **Deploy:**
   - Vercel will build and deploy automatically
   - Your app will be available at `your-project.vercel.app`

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
app/
├── api/company/
│   ├── create/route.ts          # Create company workspace
│   ├── add-product/route.ts     # Add product to company
│   ├── add-category/route.ts    # Add category to product
│   ├── add-option/route.ts      # Add option to category
│   ├── select-value/route.ts    # Select value for category
│   └── export/route.ts          # Export to Google Sheets
├── products/
│   ├── page.tsx                 # Product selection page
│   └── [product]/
│       └── page.tsx             # Category management page
├── review/page.tsx              # Review data page
├── success/page.tsx             # Success page with sheet URL
└── page.tsx                     # Homepage

components/
├── CompanyForm.tsx              # Company name input
├── ProductSelector.tsx          # Product selection interface
├── CategoryEditor.tsx           # Category and option management
└── ReviewTable.tsx              # Data review table

lib/
├── store/companyStore.ts        # Zustand state management
├── googleSheets.ts              # Google Sheets API service
└── memoryStore.ts               # In-memory data storage
```

## 🔄 API Endpoints

### POST `/api/company/create`
Creates a new company workspace.

**Request:**
```json
{
  "companyName": "ACME Spices"
}
```

### POST `/api/company/add-product`
Adds a product to a company.

**Request:**
```json
{
  "companyName": "ACME Spices",
  "productName": "Cloves"
}
```

### POST `/api/company/add-category`
Adds a category to a product.

**Request:**
```json
{
  "companyName": "ACME Spices",
  "productName": "Cloves",
  "categoryName": "Color"
}
```

### POST `/api/company/add-option`
Adds an option to a category.

**Request:**
```json
{
  "companyName": "ACME Spices",
  "productName": "Cloves",
  "categoryName": "Color",
  "option": "Red"
}
```

### POST `/api/company/select-value`
Selects a value for a category.

**Request:**
```json
{
  "companyName": "ACME Spices",
  "productName": "Cloves",
  "categoryName": "Color",
  "value": "Red"
}
```

### POST `/api/company/export`
Exports company data to Google Sheets.

**Request:**
```json
{
  "companyName": "ACME Spices"
}
```

**Response:**
```json
{
  "success": true,
  "sheetUrl": "https://docs.google.com/spreadsheets/...",
  "companyName": "ACME Spices",
  "productCount": 3
}
```

## 🗂️ Data Model

```typescript
interface CompanyData {
  companyName: string;
  products: {
    [productName: string]: {
      categories: {
        [categoryName: string]: {
          options: string[];
          selectedValue?: string;
        };
      };
    };
  };
}
```

## 🧪 Testing

### API Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Create a company
curl -X POST http://localhost:3000/api/company/create \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test Company"}'
```

### Google Sheets Integration Testing

1. Ensure your service account has proper permissions
2. Test the export functionality with sample data
3. Verify that spreadsheets are created correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Google Sheets API Authentication Failed:**
- Verify all environment variables are set correctly
- Check that your service account has Google Sheets API enabled
- Ensure the private key is properly formatted with newlines

**Build Errors on Vercel:**
- Check that all dependencies are listed in `package.json`
- Verify Next.js version compatibility
- Ensure environment variables are set in Vercel dashboard

**Data Not Persisting:**
- Remember that data is stored in memory only
- Data resets on server restart (expected behavior)

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check Vercel deployment logs
4. Verify Google Cloud Console settings

## 🔄 Updates

- **v1.0.0**: Initial release with full Google Sheets integration
- Complete company isolation and product management
- Responsive design with Tailwind CSS
- Vercel deployment ready