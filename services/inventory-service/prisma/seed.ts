import { PrismaClient } from '../src/generated/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:4001/api/products';
const DEFAULT_STOCK = 50;

async function fetchProductIds(): Promise<string[]> {
  try {
    // Dynamically fetch product IDs from the product service
    const http = require('http');
    const res = await new Promise<any>((resolve, reject) => {
      http.get(PRODUCT_SERVICE_URL, (r: any) => {
        let body = '';
        r.on('data', (chunk: any) => body += chunk);
        r.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    const products: any[] = res.data ?? res;
    if (Array.isArray(products) && products.length > 0) {
      return products.map((p: any) => p._id ?? p.id);
    }
  } catch (e) {
    console.warn('Could not reach product service – falling back to known IDs');
  }
  // Fallback: known product IDs (add any newly created product IDs here)
  return [
    '69bacd6f51f76ad72605e308', // triggered the "Item not found" error
    '69ba17b67556d601f4c06d05',
    '69ba17b67556d601f4c06d06',
    '69ba17b67556d601f4c06d07',
    '69ba17b77556d601f4c06d08',
    '69ba17b77556d601f4c06d09',
  ];
}

async function main() {
  const productIds = await fetchProductIds();
  console.log(`Seeding inventory for ${productIds.length} products...`);

  for (const productId of productIds) {
    const item = await prisma.inventoryItem.upsert({
      where: { productId },
      create: { productId, total: DEFAULT_STOCK },
      update: {},  // don't overwrite existing totals on re-run
    });
    console.log(`  ✔ ${productId}: total=${item.total}, reserved=${item.reserved}`);
  }
  console.log('Inventory seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
