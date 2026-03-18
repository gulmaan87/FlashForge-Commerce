import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

const defaultProducts = [
  {
    name: 'FlashForge GPU RTX 5090',
    description: 'Next gen graphics card.',
    price: 199900,
    sku: 'FF-GPU-5090',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    name: 'FlashForge Mechanical Keyboard',
    description: 'Wireless mechanical keyboard with RGB.',
    price: 12900,
    sku: 'FF-KBD-01',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    name: 'FlashForge Gaming Mouse',
    description: 'Ultra-lightweight gaming mouse.',
    price: 7900,
    sku: 'FF-MSE-01',
    imageUrl: 'https://via.placeholder.com/150',
  }
];

async function main() {
  console.log('Start seeding...');
  for (const p of defaultProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
