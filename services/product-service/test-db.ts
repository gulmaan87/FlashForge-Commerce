import { PrismaClient } from './src/generated/client';

const p = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  try {
    const rows = await p.product.findMany();
    console.log('SUCCESS — rows:', rows.length);
    console.log(JSON.stringify(rows.slice(0, 2), null, 2));
  } catch (e: any) {
    console.error('DB ERROR CODE:', e.code);
    console.error('DB ERROR MSG:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
