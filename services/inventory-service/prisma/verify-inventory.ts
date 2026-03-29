import { PrismaClient } from '../src/generated/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\n=== Inventory Records (${items.length} total) ===`);
  for (const item of items) {
    const available = item.total - item.reserved;
    const status = available > 0 ? '✅' : '❌ OUT OF STOCK';
    console.log(`${status}  productId=${item.productId}  total=${item.total}  reserved=${item.reserved}  available=${available}`);
  }

  const outOfStock = items.filter(i => i.total - i.reserved <= 0);
  if (outOfStock.length > 0) {
    console.log(`\n⚠️  ${outOfStock.length} product(s) have NO available stock!`);
    process.exit(1);
  } else {
    console.log(`\n✅ All ${items.length} products have stock available.\n`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
