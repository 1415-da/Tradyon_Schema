import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import * as fs from 'fs';
import * as path from 'path';

// Import predefined categories directly (same data as in companyStore.ts)
const predefinedCategories = {
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
  'Clove Buds': {
    'physical_form': ['Whole', 'Buds', 'Flowers', 'Crushed', 'Dried'],
    'origin_country': ['Indonesia', 'Comoros', 'Madagascar', 'Sri Lanka'],
    'processing_method': ['Dried', 'Organic', 'Extracted', 'Raw', 'Unprocessed', 'Processed', 'Not Processed'],
    'scientific_name': ['Caryophylli Flos', 'Syzygium Aromaticum', 'Eugenia Aromatica', 'Flos Syzygii Aromatici', 'Syzygium Aromaticum Myrtaceae', 'Flos Caryophylli', 'Eugenia Caryophyllata'],
    'packaging_type': ['Bag', 'Box', 'Pack', 'Bale'],
    'intended_use': ['Tea', 'Spice', 'Medicinal Herbs', 'Raw Materials Of Traditional Chinese Medicine', 'Food', 'Incense', 'Seasoning'],
    'quality_grade': ['Grade A', 'Second Grade', 'FAQ']
  },
  'Clove Flowers': {
    'physical_form': ['Whole', 'Buds', 'Flowers', 'Crushed', 'Dried', 'Flower', 'Bud'],
    'origin_country': ['United States', 'Indonesia', 'Comoros', 'China', 'Madagascar'],
    'processing_method': ['Dried', 'Organic', 'Extracted', 'Raw', 'Unprocessed', 'Processed', 'Not Processed'],
    'scientific_name': ['Caryophylli Flos', 'Syzygium Aromaticum', 'Eugenia Aromatica', 'Flos Syzygii Aromatici', 'Syzygium Aromaticum Myrtaceae', 'Flos Caryophylli', 'Eugenia Caryophyllata'],
    'packaging_type': ['Bag', 'Box', 'Pack', 'Bale'],
    'intended_use': ['Tea', 'Spice', 'Medicinal Herbs', 'Raw Materials Of Traditional Chinese Medicine', 'Food', 'Incense', 'Seasoning'],
    'quality_grade': ['Grade A', 'Second Grade', 'FAQ']
  },
  'Clove Dust': {
    'physical_form': ['Dust', 'Fines'],
    'origin_country': ['Indonesia'],
    'packaging_type': ['Bag']
  },
  'Clove Husks': {
    'product_type': ['Clove Husks', 'Clove Pods', 'Clove Bark', 'Clove Shell'],
    'physical_form': ['Unground', 'Dried'],
    'packaging_type': ['Pp Bag', 'Bag', 'Bale']
  },
  'Clove Seeds': {
    'physical_form': ['Whole', 'Unground'],
    'processing_method': ['Dried', 'Steam Sterilized'],
    'origin_country': ['Indonesia'],
    'packaging_type': ['Bag']
  },
  'Clove Stems': {
    'origin_country': ['Madagascar', 'Indonesia', 'Comoros', 'Sri Lanka', 'Zanzibar'],
    'use': ['For Manufacturing Of Dhoop And Pooja Samagri', 'Food', 'For Industrial Use', 'Spice Processing', 'Tea'],
    'processing_method': ['Eto Treated', 'Dried', 'Cleaned', 'Sterilized', 'Germ Reduced', 'Unground'],
    'physical_form': ['Stems', 'Stalks', 'Powder', 'Twig', 'With Oil', 'Broken', 'With Flowers', 'Cut', 'Whole'],
    'quality': ['Grade 1', 'Premium', 'Faq', 'Hps', 'Fancy', 'Extra', 'Standard'],
    'crop_year': ['2025', '2019', '2024', '2023', '2022', '2021', '2020']
  },
  'Ground Cloves': {
    'physical_form': ['Ground', 'Powder', 'Crushed'],
    'processing_method': ['Eto Treated', 'Eto Sterilized', 'Steam Sterilized', 'Steam Treated', 'Dried', 'Sterile Treated'],
    'mesh_size': ['Mesh 18', 'Mesh 30', 'Mesh 40', 'Mesh 35', 'Mesh 25', 'Mesh 50', 'Mesh 60', '30 Mesh'],
    'origin_country': ['Vietnam', 'Indonesia'],
    'quality_grade': ['Grinding Quality', 'Economy', 'Hand Picked Selection'],
    'organic': ['Organic'],
    'volatile_oil_content': ['14 Vo', '10% Vo', '15% Vo', '8% Vo', '3% Vo']
  },
  'Whole Cloves': {
    'origin_country': ['Indonesia', 'Madagascar', 'Comoros', 'Sri Lanka', 'Brazil', 'India', 'Zanzibar', 'Tanzania'],
    'physical_form': ['Whole', 'Long', 'Dried', 'Buds', 'Crushed', 'Uncrushed', 'Rolls'],
    'quality_grade': ['Cg3', 'Premium Quality', 'No 1', 'Bahia', 'Bahia Nr 1', 'Hps', 'Grade 1', 'Bahia Nr. 1', 'Especial', 'Gourmet', 'Faq', 'Premium', 'Cleaned', 'Good Quality', 'G1', 'Fancy', 'A Grade', 'Grade 2', 'Ab 6', 'Standard', 'Clean Grade A', 'Aa Grade', 'Grinding Quality', 'Cg1', 'North Quality', 'Europe Extra', 'Extra Gourmet', 'Grade A', 'Abs Grade', 'North Crop', 'Grade', 'Regular', 'B Grade', 'Grinding Grade', 'Grade B', 'Clean Quality', 'Machine Cleaned', 'Grade I', 'L-1mnmb Id 2017', 'Selected', 'Organic', 'Grade 4', 'Standard Quality'],
    'processing_method': ['New Crop', 'Raw', 'Hps', 'Hand Picked', 'Steam Treated', 'Dried', 'Organic', 'Cleaned', 'Steam', 'Eto Sterilized', 'Well Dried', 'Treated', 'Selected', 'North Quality', 'North Crop', 'Steam Sterilized', 'Recleaned', 'Sterilized', 'Uncrushed', 'Unprocessed', 'Preliminarily Processed', 'Unsliced', 'Unseasoned', 'Machine Cleaned', 'Sieved', 'Sterile Treated', 'Oven Dried'],
    'headless_percentage': ['15% Max Headless', '2% Max Headless', '10% Max Headless', '5% Max Headless'],
    'volatile_oil_percentage': ['8% Vo', '16% Min V.o.', '17% Min V.o.'],
    'mesh_size': ['Mesh 30'],
    'variety': ['Lal Pari', 'Bahia', 'Bahiano', 'Gourmet', 'Regular', 'Forest', 'Reguler', 'Manado', 'GORILLA', 'Hand Picked', 'Java', 'Zanzibar']
  },
  'Bell Pepper': {
    'color': ['Green', 'Mixed', 'Red', 'Yellow'],
    'physical_form': ['Whole', 'Crushed', 'Rings', 'Seeds', 'Flakes', 'Powder', 'Granular', 'Cracked', 'Fines', 'Ground', 'Diced', 'Stalks', 'Chopped', 'Granules', 'Seeded', 'Split'],
    'processing_method': ['Dehydrated', 'In Brine', 'Steam Sterilized', 'Freeze Dried', 'Roasted', 'Frozen', 'Dried', 'Fried', 'Pickled', 'Air Dried', 'Soaked', 'Blanched'],
    'origin_country': ['China', 'Vietnam', 'India', 'Ecuador', 'Madagascar', 'VN'],
    'quality_grade': ['Soft', 'Grade A', 'Second Grade', 'First Grade', 'Premium', 'Standard'],
    'variety': ['Sweet Pepper', 'Sweet', 'YOLO WONDER', 'California Wonder', 'Sweet Prize F1', 'Revelation Seed', 'Rainbow', 'Cubanelle', 'Bell Pepper', 'Pathfinder', 'Pepper', 'Green Cap', 'Aji Dulce', 'Long Green', 'Green Queen', 'High Fly 2', 'Beauty Green', 'Optimum', 'Sweet Prize', 'Paprika', 'Talash', 'Guajillo', 'Rich Star F1', 'Capital F1']
  },
  'Black Pepper': {
    'variety': ['Ceylon', 'Lampung', 'Belem', 'Para', 'Malabar', 'Wayanad', 'Cape', 'Silver Dragon', 'Tellicherry', 'Muntok', 'Vg1', 'Lampung Black Pepper', 'Ladaku', 'Kampot', 'White', 'Vasta', 'Vinh Linh', 'Golden Dragon', 'Sarawak', 'Saigon', 'Phu Quoc', 'Piper', 'Pleiku', 'Madagascar', 'TGSEB', 'Light Pepper', 'Salami', 'Kashmiri', 'Cassia', 'Seasoning Salt', 'Nutmeg', 'Super Diamond', 'Mg1', 'Mgi', 'Vijay', 'Vipep Tfi', 'Ong Cha Va', 'Brown', 'Teja', 'Ha Mai-ca', 'Pepper Nigrum', 'Thai', 'Korintje', 'Lira', 'Guntur', 'Gia Bao', 'Le Chi', 'Maya', 'Mayas', 'Voatsiperifery', 'Luong', 'Brasil', 'Robusta', 'Rajarata', 'Fairy', 'Tieu Den', 'Korintji', 'Bydagi', 'Vinh Toan', 'Vipep', 'Coriander', 'Alleppey', 'Piper Nigrum L'],
    'origin_country': ['Vietnam', 'Brazil', 'Sri Lanka', 'Madagascar', 'Indonesia', 'India', 'Malaysia', 'Ecuador', 'China', 'Cambodia', 'Laos', 'Tanzania', 'Zanzibar', 'Iran', 'Philippines', 'Sarawak', 'Spain', 'United Kingdom'],
    'physical_form': ['Ground / Powder', 'Whole', 'Cracked / Coarse', 'Husk', 'Seeds', 'Cracked / Coarse; Ground / Powder', 'Ground / Powder; Whole', 'Extract', 'Flakes', 'Seeds; Whole', 'Oil', 'Paste'],
    'processing_methods': ['Steam Sterilized', 'ETO Sterilized', 'Machine Cleaned', 'Sun-dried', 'Machine Cleaned; Sun-dried', 'Irradiated', 'ETO Sterilized; Steam Sterilized', 'ETO Sterilized; Machine Cleaned'],
    'certifications': ['Fair Trade', 'Organic', 'Fair Trade; Organic', 'Demeter', 'HALAL', 'RFA'],
    'density_min_g_l': ['580.0', '570.0', '560.0', '500.0', '550.0', '600.0', '1.0', '590.0', '400.0', '5.0', '540.0', '520.0', '280.0', '561.0', '56.0', '190.0', '530.0', '568.0', '450.0', '0.0', '200.0', '220.0', '230.0', '480.0', '525.0', '566.0', '575.0', '640.0', '215.0', '680.0', '50.0', '670.0', '320.0', '350.0', '420.0', '470.0', '300.0', '440.0', '490.0', '750.0', '250.0', '630.0', '570580.0', '800.0', '535.0', '625.0'],
    'density_max_g_l': ['580.0', '570.0', '560.0', '500.0', '550.0', '600.0', '590.0', '400.0', '50.0', '540.0', '520.0', '300.0', '619.0', '80.0', '56.0', '200.0', '530.0', '649.0', '450.0', '57.0', '220.0', '230.0', '480.0', '525.0', '566.0', '568.0', '575.0', '640.0', '215.0', '680.0', '670.0', '320.0', '350.0', '420.0', '470.0', '440.0', '490.0', '5.0', '750.0', '280.0', '250.0', '630.0', '570580.0', '800.0', '535.0', '55.0', '58.0', '70.0', '625.0', '190.0'],
    'size_min_mm': ['5.0', '3.0', '1.0', '12.0', '0.5', '1.5', '0.15', '4.25', '20.0', '16.0', '14.0', '15.0', '1.2', '2.5', '0.3', '0.25', '2.0', '18.0', '0.4', '6.0', '17.0', '8.0', '4.0', '0.8', '1.18', '6.5', '7.0', '0.6', '0.7000000000000001', '0.55'],
    'size_max_mm': ['5.0', '4.0', '2.0', '20.0', '1.7', '1.5', '0.5', '4.75', '16.0', '15.0', '1.0', '2.5', '0.3', '1.19', '18.0', '0.8', '12.0', '6.0', '3.0', '0.4', '1.18', '7.0', '12.5', '1.2', '0.7000000000000001', '14.0', '8.0', '2.4', '1.25', '0.55'],
    'asta_color_value': ['570.0', '580.0', '550.0', '560.0', '500.0', '3.0', '5.0', '4.0', '600.0', '11.0', '590.0', '575.0', '617.0', '520.0', '60.0', '480.0', '530.0', '630.0'],
    'moisture_content': ['13.0', '12.5', '12.0', '13.5', '7.0', '11.0'],
    'light_berries': ['2.0', '3.0'],
    'packaging_type': ['Bag', 'Carton / Box', 'Bales', 'Pack', 'Bolsas', 'Packages', 'Grinder', 'Drum', 'Packet', 'Super Packs', 'Bulk Bag', 'Package', 'Wooden Pallet', 'Ctn', 'Jar', 'Containers', '25Kg', 'Tin', 'Container', 'Pallet', 'Bottle', 'Barrel', 'Pouch', 'Pp', 'Kg', 'Kgs', 'Lbs Pack', 'Pal Llet', 'Pkt', 'Bolsas Dobles De Polypropileno', 'Polypropylene Double', 'Ctns', 'Mts', 'Duplex', 'Back', 'Jumbo', '25 Kg', 'Pkg', '10Kg/Barrel', 'Túi', 'Túi/Kiện', 'Drums', 'Tube', 'Jet Packages', '25 Kg/Back', '25Kgs', '25Kg/Back', '20Kg/Back', 'Paper', 'Paper Car', 'Pap', 'P', 'Pkdinbluepebgs'],
    'packaging_weight_kg': ['25.0', '50.0', '40.0', '10.0', '20.0']
  },
  'Cayenne Pepper': {
    'variety': ['Cayenne', 'Red', 'Birds Eye', 'Guajillo', 'Paprika'],
    'physical_form': ['Ground / Powder', 'Mash', 'Cracked / Coarse', 'Whole', 'Paste', 'Flakes'],
    'color': ['Red', 'Yellow'],
    'processing_methods': ['Steam Sterilized', 'ETO Sterilized'],
    'certifications': ['Organic'],
    'shu_min': ['0.0', '60000.0', '37500.0', '37000.0', '35000.0', '40.0'],
    'shu_max': ['40.0', '60000.0', '37500.0', '43000.0', '35000.0'],
    'asta_color_value': []
  },
  'Cubeb Pepper': {
    'variety': ['Litsea Cubeba', 'Piper Cubeba', 'Wild Forest Pepper'],
    'origin_country': ['Indonesia', 'Vietnam'],
    'physical_form': ['Whole'],
    'processing_methods': ['ETO Sterilized'],
    'packaging_type': ['Bag', 'Carton / Box', 'Barrel'],
    'packaging_weight_kg': []
  },
  'Long Pepper': {
    'variety': ['Lampung', 'Java Long Pepper'],
    'origin_country': ['Indonesia', 'Vietnam', 'China', 'Cambodia'],
    'physical_form': ['Whole', 'Ground / Powder'],
    'processing_methods': ['ETO Sterilized'],
    'certifications': [],
    'asta_color_value': [],
    'packaging_type': ['Bag', 'Carton / Box', 'Tin', 'Tube', 'Pack', 'Jar'],
    'packaging_weight_kg': []
  },
  'Pimento': {
    'variety': ['Mexican Pimento', 'Pimento, Allspice', 'Allspice', 'Pimento', 'Pimienta Dioica', 'Guajillo', 'Pimienta Mexicana', 'Pimienta Nat', 'Pimiento Allspice', 'Piment', 'Pimiento Paprika'],
    'origin_country': ['Mexico', 'Honduras', 'Jamaica', 'Guatemala', 'Brazil', 'Vietnam'],
    'physical_form': ['Whole', 'Ground / Powder', 'Paste', 'Cracked / Coarse', 'Seeds'],
    'processing_methods': ['Sun-dried', 'Steam Sterilized', 'Machine Cleaned', 'ETO Sterilized'],
    'certifications': [],
    'purity': ['99.9', '99.5'],
    'packaging_type': ['Bag', 'Carton / Box', 'Polypropylene', 'Containers', 'Cajas', 'Package', 'Sacos', 'Pacas', 'Jar', 'Bottles'],
    'packaging_weight_kg': []
  },
  '0904 Pinhead Pepper': {
    'origin_country': ['Brazil', 'Vietnam', 'Sri Lanka', 'India', 'Indonesia'],
    'physical_form': ['Whole', 'Ground / Powder; Whole', 'Ground / Powder'],
    'processing_methods': ['Irradiated', 'ETO Sterilized', 'Steam Sterilized', 'Machine Cleaned'],
    'moisture_content': ['13.0'],
    'impurities': ['1.0', '2.0', '10.0'],
    'packaging_weight_kg': []
  },
  'Pink Pepper': {
    'origin_country': ['Brazil'],
    'physical_form': ['Whole'],
    'processing_methods': ['Steam Sterilized'],
    'certifications': []
  },
  'Red Chilli': {
    'variety': ['Cayenne', 'Red', 'Birds Eye', 'Guajillo', 'Paprika', 'Thai Chilli', 'Jalapeno', 'Habanero', 'Chipotle', 'Ancho', 'Chilaca', 'Poblano', 'Serrano', 'Tabasco', 'Piquin', 'Chile de Arbol', 'Mulato', 'Pasilla', 'Cascabel', 'Chilhuacle', 'Tepin', 'Peperoncino'],
    'origin_country': ['India', 'China', 'Vietnam', 'Thailand', 'Mexico', 'Peru', 'Pakistan', 'Turkey', 'Spain', 'USA', 'Chile', 'Brazil', 'Indonesia', 'Malaysia', 'Sri Lanka', 'Bangladesh', 'South Korea', 'Iran', 'Myanmar', 'Colombia'],
    'physical_form': ['Whole', 'Ground / Powder', 'Cracked / Coarse', 'Flakes', 'Paste', 'Seeds', 'Stems', 'Powder', 'Granular', 'Crushed', 'Fines', 'Chopped', 'Diced', 'Slices', 'Rings'],
    'stem': ['Stemless', 'With Stem'],
    'processing_methods': ['ETO Sterilized', 'Steam Sterilized', 'Irradiated', 'Machine Cleaned', 'Sun-dried', 'Freeze Dried', 'Air Dried'],
    'certifications': ['Organic', 'Fair Trade', 'HALAL'],
    'mesh_min': ['5.0', '10.0', '20.0', '30.0', '40.0', '50.0', '60.0', '80.0', '100.0', '120.0', '150.0', '200.0', '300.0', '400.0', '500.0'],
    'mesh_max': ['10.0', '20.0', '30.0', '40.0', '50.0', '60.0', '80.0', '100.0', '120.0', '150.0', '200.0', '300.0', '400.0', '500.0', '600.0'],
    'shu_min': ['500.0', '1000.0', '2500.0', '5000.0', '8000.0', '10000.0', '20000.0', '30000.0', '40000.0', '50000.0', '75000.0', '100000.0', '150000.0', '200000.0'],
    'shu_max': ['1000.0', '2500.0', '5000.0', '8000.0', '10000.0', '20000.0', '30000.0', '40000.0', '50000.0', '75000.0', '100000.0', '150000.0', '200000.0', '300000.0'],
    'asta_color_value': ['50.0', '100.0', '150.0', '200.0', '250.0', '300.0', '350.0', '400.0', '450.0', '500.0', '600.0', '700.0', '800.0', '900.0', '1000.0']
  },
  'Sichuan Pepper': {
    'variety': ['Sichuan Peppercorn', 'Andaliman Pepper', 'Wild Forest Pepper', 'Timut Pepper', 'Kashmiri Chilly Powder'],
    'origin_country': ['China', 'Vietnam'],
    'physical_form': ['Whole', 'Ground / Powder', 'Flakes', 'Seeds'],
    'processing_methods': ['Steam Sterilized']
  },
  'White Pepper': {
    'variety': ['Muntok', 'Bahia', 'Lampung', 'Montok', 'Sulawesi', 'Ruhunu', 'Samarinda', 'Sarawak', 'White Pepper', 'Tieu', 'Kampot'],
    'origin_country': ['Vietnam', 'Brazil', 'Indonesia', 'Sri Lanka', 'Malaysia', 'India', 'China'],
    'physical_form': ['Whole', 'Ground / Powder', 'Ground / Powder; Whole', 'Paste', 'Cracked / Coarse', 'Seeds'],
    'processing_methods': ['Machine Cleaned', 'ETO Sterilized', 'Sun-dried', 'Steam Sterilized'],
    'certifications': ['Organic'],
    'density_min_g_l': ['620.0', '640.0', '651.0', '660.0', '550.0', '570.0', '630.0', '650.0', '500.0', '600.0', '580.0', '590.0', '625.0'],
    'density_max_g_l': ['630.0', '640.0', '651.0', '660.0', '550.0', '570.0', '650.0', '500.0', '600.0', '580.0', '590.0', '620.0', '625.0'],
    'mesh_min': ['40.0', '70.0', '60.0', '30.0', '50.0', '80.0', '45.0', '300.0', '12.0', '400.0', '0.8', '600.0', '250.0', '350.0', '180.0'],
    'mesh_max': ['40.0', '70.0', '60.0', '30.0', '50.0', '80.0', '45.0', '300.0', '12.0', '4000.0', '1.2', '1200.0', '600.0', '350.0', '400.0', '250.0', '180.0'],
    'packaging_type': ['Bottle', 'Bag', 'Pack', 'Carton / Box', 'Bulk Bag', 'Kraft Cardboards', 'Ctn', 'Pouch', 'Polypropylene', 'Pallet', 'Barrel', 'Tray', 'Jar', 'Tin'],
    'packaging_weight_kg': []
  }
};

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyData } = await request.json();

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

    // If still not found but client sent companyData, use it and store in memory
    if (!company && companyData) {
      console.log('Export API: Company data not found in memory, restoring from client data');
      memoryStore.restoreCompany(normalizedCompanyName, companyData);
      company = companyData;
      console.log('Export API: Company data restored from client');
    }

    // If still not found, this is an error
    if (!company) {
      console.log('Export API: === COMPANY NOT FOUND ===');
      console.log('Export API: Searched for:', normalizedCompanyName);
      console.log('Export API: Also tried:', companyName.trim());
      console.log('Export API: Available companies:', Array.from(memoryStore['companies'].keys()));
      return NextResponse.json(
        {
          error: 'Company data not found. Please ensure you have completed the setup process.',
          details: 'No company data available'
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
      const categories: { [key: string]: string[] } = {};

      // Include all categories that the user has configured (both predefined and custom)
      Object.keys(product.categories).forEach(categoryName => {
        const category = product.categories[categoryName];
        categories[categoryName] = category.selectedValues || []; // Only include selected values
      });

      jsonData.products[productName] = {
        categories: categories,
        categoryCount: Object.keys(categories).length,
        totalSelectedValues: Object.values(categories).reduce((sum, cat: any) => sum + cat.length, 0)
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

    return NextResponse.json({
      success: true,
      jsonFilePath: `output/${jsonFileName}`,
      jsonFileName: jsonFileName,
      companyName: normalizedCompanyName,
      contactPerson: company.contactPerson || 'Not provided',
      productCount: productNames.length,
      exportTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error exporting data to JSON:', error);
    return NextResponse.json(
      { error: 'Failed to export data to JSON format' },
      { status: 500 }
    );
  }
}
