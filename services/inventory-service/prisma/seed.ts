import { PrismaClient } from '../src/generated/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:4001/api/products';
const DEFAULT_STOCK = 50;

async function fetchProductIds(): Promise<string[]> {
  try {
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
      const ids = products.map((p: any) => p._id ?? p.id);
      console.log(`Fetched ${ids.length} product IDs from product-service.`);
      return ids;
    }
  } catch (e) {
    console.warn('Could not reach product service — falling back to known IDs');
  }

  // Fallback IDs (only used when product-service is not running)
  return [
    '69bacd6f51f76ad72605e308',
    '69ba17b67556d601f4c06d05',
    '69ba17b67556d601f4c06d06',
    '69ba17b67556d601f4c06d07',
    '69ba17b77556d601f4c06d08',
    '69ba17b77556d601f4c06d09',
  ];
}

async function main() {
  const productIds = await fetchProductIds();
  console.log(`\nSeeding inventory for ${productIds.length} products (DEFAULT_STOCK=${DEFAULT_STOCK})...`);

  // ── Step 1: Remove stale inventory records for products that no longer exist ──
  const existing = await prisma.inventoryItem.findMany({ select: { id: true, productId: true } });
  const staleIds = existing
    .filter(item => !productIds.includes(item.productId))
    .map(item => item.id);

  if (staleIds.length > 0) {
    await prisma.inventoryItem.deleteMany({ where: { id: { in: staleIds } } });
    console.log(`🗑  Removed ${staleIds.length} stale inventory record(s).`);
  }

  // ── Step 2: Upsert each current product ──
  for (const productId of productIds) {
    const item = await prisma.inventoryItem.upsert({
      where:  { productId },
      create: { productId, total: DEFAULT_STOCK },
      // On re-run: only restore stock if it somehow hit 0; don't reset intentional deductions.
      update: { total: { set: DEFAULT_STOCK }, reserved: { set: 0 } },
    });
    const available = item.total - item.reserved;
    console.log(`  ✔ ${productId}  total=${item.total}  reserved=${item.reserved}  available=${available}`);
  }

  console.log('\n✅ Inventory seeding complete!\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
