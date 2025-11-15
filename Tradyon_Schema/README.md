# Product Specification System

A fullstack Next.js application that allows companies to create detailed product specifications and export them directly to Google Sheets. Each company gets its own isolated workspace with customizable categories and options.

## 🚀 Features

- **Company Isolation**: Each company has its own separate workspace
- **Product Management**: Select from predefined products or add custom ones
- **Category Customization**: Add predefined or custom categories for each product
- **Option Management**: Configure dropdown options for each category
- **JSON Export**: Automatic export of all specifications to JSON format in the output folder
- **Vercel Deployment**: Production-ready for Vercel hosting
- **Responsive Design**: Works on all devices with Tailwind CSS

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (no separate server)
- **State Management**: Zustand for client-side state
- **Storage**: In-memory (resets on server restart)
- **Export**: JSON file export
- **Deployment**: Vercel

## 📋 Workflow

1. **Enter Company Name** → Creates isolated workspace
2. **Select Products** → Choose from predefined or add custom products
3. **Configure Categories** → Add categories and options for each product
4. **Review & Export** → Preview data and export to JSON format
5. **Success** → Access your exported JSON data

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn

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

No environment variables are required for this application. All data is exported to JSON files in the local `output/` folder.

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically (no environment variables required)
   - Note: JSON exports are saved to the local file system and won't be available in Vercel deployment

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js

2. **Deploy:**
   - Vercel will build and deploy automatically
   - Your app will be available at `your-project.vercel.app`
   - Note: JSON exports are saved to the local file system and won't be available in Vercel deployment

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
Exports company data to JSON format.

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
  "jsonFilePath": "output/ACME_Spices.json",
  "jsonFileName": "ACME_Spices.json",
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

### JSON Export Testing

1. Test the export functionality with sample data
2. Verify that JSON files are created in the `output/` folder
3. Check that the JSON structure contains all expected data

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

**JSON Export Failed:**
- Check that the `output/` folder exists and is writable
- Verify that the server has permission to write files
- Ensure the company data is properly configured before export

**Build Errors on Vercel:**
- Check that all dependencies are listed in `package.json`
- Verify Next.js version compatibility

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

- **v1.0.0**: Initial release with JSON export functionality
- Complete company isolation and product management
- Responsive design with Tailwind CSS
- Vercel deployment ready