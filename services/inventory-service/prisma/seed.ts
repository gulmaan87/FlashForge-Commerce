import { PrismaClient } from '../src/generated/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

const productIds = [
  '69ba17b67556d601f4c06d05',
  '69ba17b67556d601f4c06d06',
  '69ba17b67556d601f4c06d07',
  '69ba17b77556d601f4c06d08',
  '69ba17b77556d601f4c06d09',
];

async function main() {
  for (const productId of productIds) {
    const item = await prisma.inventoryItem.upsert({
      where: { productId },
      create: { productId, total: 50 },
      update: { total: 50 },
    });
    console.log(`Seeded inventory for ${productId}: total=${item.total}, reserved=${item.reserved}`);
  }
  console.log('Inventory seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
