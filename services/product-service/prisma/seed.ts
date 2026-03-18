import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

const defaultProducts = [
  {
    name: 'Ocean Blue Shirt',
    description: 'Ocean blue cotton shirt with a narrow collar and buttons down the front and long sleeves. Comfortable fit and tiled kalidoscope patterns.',
    price: 5000,
    sku: 'ocean-blue-shirt',
    imageUrl: 'https://burst.shopifycdn.com/photos/young-man-in-bright-fashion_925x.jpg',
  },
  {
    name: 'Classic Varsity Top',
    description: 'Womens casual varsity top. This grey and black buttoned top is a sport-inspired piece complete with an embroidered letter.',
    price: 6000,
    sku: 'classic-varsity-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/casual-fashion-woman_925x.jpg',
  },
  {
    name: 'Yellow Wool Jumper',
    description: 'Knitted jumper in a soft wool blend with low dropped shoulders and wide sleeves and think cuffs. Perfect for keeping warm during Fall.',
    price: 8000,
    sku: 'yellow-wool-jumper',
    imageUrl: 'https://burst.shopifycdn.com/photos/autumn-photographer-taking-picture_925x.jpg',
  },
  {
    name: 'Floral White Top',
    description: 'Stylish sleeveless white top with a floral pattern.',
    price: 7500,
    sku: 'floral-white-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/city-woman-fashion_925x@2x.jpg',
  },
  {
    name: 'Striped Silk Blouse',
    description: 'Ultra-stylish black and red striped silk blouse with buckle collar and matching button pants.',
    price: 5000,
    sku: 'striped-silk-blouse',
    imageUrl: 'https://burst.shopifycdn.com/photos/striped-blouse-fashion_925x.jpg',
  },
  {
    name: 'Classic Leather Jacket',
    description: 'Womans zipped leather jacket. Adjustable belt for a comfortable fit, complete with shoulder pads and front zip pocket.',
    price: 8000,
    sku: 'classic-leather-jacket',
    imageUrl: 'https://burst.shopifycdn.com/photos/leather-jacket-and-tea_925x.jpg',
  },
  {
    name: 'Dark Denim Top',
    description: 'Classic dark denim top with chest pockets, long sleeves with buttoned cuffs, and a ripped hem effect.',
    price: 6000,
    sku: 'dark-denim-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/young-female-models-denim_925x.jpg',
  },
  {
    name: 'Navy Sports Jacket',
    description: 'Long-sleeved navy waterproof jacket in thin, polyester fabric with a soft mesh inside. The durable water-repellent finish means you\'ll be kept comfortable and protected when out in all weathers.',
    price: 6000,
    sku: 'navy-sport-jacket',
    imageUrl: 'https://burst.shopifycdn.com/photos/mens-fall-fashion-jacket_925x.jpg',
  },
  {
    name: 'Soft Winter Jacket',
    description: 'Thick black winter jacket, with soft fleece lining. Perfect for those cold weather days.',
    price: 5000,
    sku: 'dark-winter-jacket',
    imageUrl: 'https://burst.shopifycdn.com/photos/smiling-woman-on-snowy-afternoon_925x.jpg',
  },
  {
    name: 'Black Leather Bag',
    description: 'Womens black leather bag, with ample space. Can be worn over the shoulder, or remove straps to carry in your hand.',
    price: 3000,
    sku: 'black-leather-bag',
    imageUrl: 'https://burst.shopifycdn.com/photos/black-bag-over-the-shoulder_925x.jpg',
  },
  {
    name: 'Zipped Jacket',
    description: 'Dark navy and light blue men\'s zipped waterproof jacket with an outer zipped chestpocket for easy storeage.',
    price: 6500,
    sku: 'zipped-jacket',
    imageUrl: 'https://burst.shopifycdn.com/photos/menswear-blue-zip-up-jacket_925x.jpg',
  },
  {
    name: 'Silk Summer Top',
    description: 'Silk womens top with short sleeves and number pattern.',
    price: 7000,
    sku: 'silk-summer-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/young-hip-woman-at-carnival_925x.jpg',
  },
  {
    name: 'Long Sleeve Cotton Top',
    description: 'Black cotton womens top, with long sleeves, no collar and a thick hem.',
    price: 5000,
    sku: 'longsleeve-cotton-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/woman-outside-brownstone_925x.jpg',
  },
  {
    name: 'Chequered Red Shirt',
    description: 'Classic mens plaid flannel shirt with long sleeves, in chequered style, with two chest pockets.',
    price: 5000,
    sku: 'chequered-red-shirt',
    imageUrl: 'https://burst.shopifycdn.com/photos/red-plaid-shirt_925x.jpg',
  },
  {
    name: 'White Cotton Shirt',
    description: 'Plain white cotton long sleeved shirt with loose collar. Small buttons and front pocket.',
    price: 3000,
    sku: 'white-cotton-shirt',
    imageUrl: 'https://burst.shopifycdn.com/photos/smiling-woman-poses_925x.jpg',
  },
  {
    name: 'Olive Green Jacket',
    description: 'Loose fitting olive green jacket with buttons and large pockets. Multicoloured pattern on the front of the shoulders.',
    price: 6500,
    sku: 'olive-green-jacket',
    imageUrl: 'https://burst.shopifycdn.com/photos/urban-fashion_925x.jpg',
  },
  {
    name: 'Blue Silk Tuxedo',
    description: 'Blue silk tuxedo with marbled aquatic pattern and dark lining. Sleeves are complete with rounded hem and black buttons.',
    price: 7000,
    sku: 'blue-silk-tuxedo',
    imageUrl: 'https://burst.shopifycdn.com/photos/man-adjusts-blue-tuxedo-bowtie_925x.jpg',
  },
  {
    name: 'Red Sports Tee',
    description: 'Women\'s red sporty t-shirt with colorful details on the sleeves and a small white pocket.',
    price: 5000,
    sku: 'red-sports-tee',
    imageUrl: 'https://burst.shopifycdn.com/photos/womens-red-t-shirt_925x.jpg',
  },
  {
    name: 'Striped Skirt and Top',
    description: 'Black cotton top with matching striped skirt.',
    price: 5000,
    sku: 'striped-skirt-and-top',
    imageUrl: 'https://burst.shopifycdn.com/photos/woman-in-the-city_925x.jpg',
  },
  {
    name: 'LED High Tops',
    description: 'Black high top shoes with green LED lights in the sole, tied up with laces and a buckle.',
    price: 8000,
    sku: 'led-high-tops',
    imageUrl: 'https://burst.shopifycdn.com/photos/putting-on-your-shoes_925x.jpg',
  },
];

async function main() {
  console.log('Start seeding ...');

  // Clear existing products
  await prisma.product.deleteMany({});
  console.log('Cleared existing products.');

  for (const p of defaultProducts) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
      },
      create: p,
    });
    console.log(`Upserted product: ${product.name} ($${(product.price / 100).toFixed(2)})`);
  }

  console.log(`Seeding finished. ${defaultProducts.length} products loaded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
