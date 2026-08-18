const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    
    // Create directory if not exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      return resolve(`/categories/${path.basename(filepath)}`);
    }

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`/categories/${path.basename(filepath)}`);
        });
      } else {
        console.error(`Failed to download ${url}: ${res.statusCode}`);
        resolve(null);
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err.message);
      resolve(null);
    });
  });
};

const TEMU_CATEGORIES = [
  {
    name: 'ملابس نسائية', nameEn: 'Women\'s Clothing', slug: 'womens-clothing', icon: '👗', 
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'فساتين', nameEn: 'Dresses', slug: 'womens-dresses', sub: [
        { name: 'فساتين صيفية', nameEn: 'Summer Dresses', slug: 'womens-summer-dresses' },
        { name: 'فساتين سهرة', nameEn: 'Evening Dresses', slug: 'womens-evening-dresses' }
      ]},
      { name: 'بلايز وقمصان', nameEn: 'Tops & Shirts', slug: 'womens-tops', sub: [
        { name: 'تيشيرتات', nameEn: 'T-Shirts', slug: 'womens-tshirts' },
        { name: 'بلوزات', nameEn: 'Blouses', slug: 'womens-blouses' }
      ]},
      { name: 'بناطيل وتنانير', nameEn: 'Bottoms', slug: 'womens-bottoms', sub: [
        { name: 'جينز', nameEn: 'Jeans', slug: 'womens-jeans' },
        { name: 'تنانير', nameEn: 'Skirts', slug: 'womens-skirts' }
      ]},
      { name: 'ملابس رياضية', nameEn: 'Activewear', slug: 'womens-activewear' },
      { name: 'ملابس داخلية', nameEn: 'Intimates', slug: 'womens-intimates' }
    ]
  },
  {
    name: 'ملابس رجالية', nameEn: 'Men\'s Clothing', slug: 'mens-clothing', icon: '👕',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'تيشيرتات', nameEn: 'T-Shirts', slug: 'mens-tshirts' },
      { name: 'قمصان', nameEn: 'Shirts', slug: 'mens-shirts', sub: [
        { name: 'كاجوال', nameEn: 'Casual', slug: 'mens-casual-shirts' },
        { name: 'رسمي', nameEn: 'Formal', slug: 'mens-formal-shirts' }
      ]},
      { name: 'بناطيل', nameEn: 'Pants', slug: 'mens-pants', sub: [
        { name: 'جينز', nameEn: 'Jeans', slug: 'mens-jeans' },
        { name: 'رياضي', nameEn: 'Sweatpants', slug: 'mens-sweatpants' }
      ]},
      { name: 'جواكت ومعاطف', nameEn: 'Jackets & Coats', slug: 'mens-jackets' },
      { name: 'ملابس رياضية', nameEn: 'Activewear', slug: 'mens-activewear' }
    ]
  },
  {
    name: 'الأطفال والرضع', nameEn: 'Kids & Babies', slug: 'kids-babies', icon: '🧸',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'ملابس بناتي', nameEn: 'Girls Clothing', slug: 'girls-clothing', sub: [
        { name: 'فساتين بناتي', nameEn: 'Girls Dresses', slug: 'girls-dresses' },
        { name: 'أطقم بناتي', nameEn: 'Girls Sets', slug: 'girls-sets' }
      ]},
      { name: 'ملابس ولادي', nameEn: 'Boys Clothing', slug: 'boys-clothing', sub: [
        { name: 'تيشيرتات ولادي', nameEn: 'Boys T-Shirts', slug: 'boys-tshirts' },
        { name: 'أطقم ولادي', nameEn: 'Boys Sets', slug: 'boys-sets' }
      ]},
      { name: 'ملابس الرضع', nameEn: 'Baby Clothing', slug: 'baby-clothing' },
      { name: 'ألعاب', nameEn: 'Toys', slug: 'kids-toys' },
      { name: 'مستلزمات العناية بالطفل', nameEn: 'Baby Care', slug: 'baby-care' }
    ]
  },
  {
    name: 'الأحذية', nameEn: 'Shoes', slug: 'shoes', icon: '👟',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'أحذية نسائية', nameEn: 'Women\'s Shoes', slug: 'womens-shoes', sub: [
        { name: 'كعب عالي', nameEn: 'Heels', slug: 'womens-heels' },
        { name: 'أحذية رياضية نسائية', nameEn: 'Women\'s Sneakers', slug: 'womens-sneakers' }
      ]},
      { name: 'أحذية رجالية', nameEn: 'Men\'s Shoes', slug: 'mens-shoes', sub: [
        { name: 'أحذية رسمية', nameEn: 'Formal Shoes', slug: 'mens-formal-shoes' },
        { name: 'أحذية رياضية رجالية', nameEn: 'Men\'s Sneakers', slug: 'mens-sneakers' }
      ]},
      { name: 'أحذية أطفال', nameEn: 'Kids Shoes', slug: 'kids-shoes' }
    ]
  },
  {
    name: 'الجمال والصحة', nameEn: 'Beauty & Health', slug: 'beauty-health', icon: '💄',
    image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'مكياج', nameEn: 'Makeup', slug: 'makeup', sub: [
        { name: 'مكياج الوجه', nameEn: 'Face Makeup', slug: 'face-makeup' },
        { name: 'مكياج العيون', nameEn: 'Eye Makeup', slug: 'eye-makeup' }
      ]},
      { name: 'العناية بالبشرة', nameEn: 'Skincare', slug: 'skincare' },
      { name: 'العناية بالشعر', nameEn: 'Hair Care', slug: 'hair-care' },
      { name: 'عطور', nameEn: 'Fragrances', slug: 'fragrances' },
      { name: 'أدوات العناية الشخصية', nameEn: 'Personal Care Tools', slug: 'personal-care-tools' }
    ]
  },
  {
    name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'ديكور المنزل', nameEn: 'Home Decor', slug: 'home-decor', sub: [
        { name: 'لوحات وفنون', nameEn: 'Wall Art', slug: 'wall-art' },
        { name: 'إضاءة', nameEn: 'Lighting', slug: 'home-lighting' }
      ]},
      { name: 'أدوات المطبخ', nameEn: 'Kitchenware', slug: 'kitchenware', sub: [
        { name: 'أواني طبخ', nameEn: 'Cookware', slug: 'cookware' },
        { name: 'أدوات مائدة', nameEn: 'Tableware', slug: 'tableware' }
      ]},
      { name: 'مفروشات السرير', nameEn: 'Bedding', slug: 'bedding' },
      { name: 'حلول التخزين', nameEn: 'Storage & Organization', slug: 'storage-organization' },
      { name: 'مستلزمات الحمام', nameEn: 'Bath Accessories', slug: 'bath-accessories' }
    ]
  },
  {
    name: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'هواتف ذكية', nameEn: 'Smartphones', slug: 'smartphones' },
      { name: 'إكسسوارات الهواتف', nameEn: 'Phone Accessories', slug: 'phone-accessories', sub: [
        { name: 'أغطية وحافظات', nameEn: 'Cases & Covers', slug: 'phone-cases' },
        { name: 'شواحن وكابلات', nameEn: 'Chargers & Cables', slug: 'chargers-cables' }
      ]},
      { name: 'صوتيات وسماعات', nameEn: 'Audio & Headphones', slug: 'audio-headphones' },
      { name: 'أجهزة كمبيوتر ولابتوب', nameEn: 'Computers & Laptops', slug: 'computers-laptops' },
      { name: 'المنزل الذكي', nameEn: 'Smart Home', slug: 'smart-home' }
    ]
  },
  {
    name: 'المجوهرات والإكسسوارات', nameEn: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: '💍',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'مجوهرات نسائية', nameEn: 'Women\'s Jewelry', slug: 'womens-jewelry', sub: [
        { name: 'خواتم', nameEn: 'Rings', slug: 'womens-rings' },
        { name: 'قلائد', nameEn: 'Necklaces', slug: 'womens-necklaces' },
        { name: 'أقراط', nameEn: 'Earrings', slug: 'womens-earrings' }
      ]},
      { name: 'ساعات', nameEn: 'Watches', slug: 'watches', sub: [
        { name: 'ساعات ذكية', nameEn: 'Smart Watches', slug: 'smart-watches' },
        { name: 'ساعات كلاسيكية', nameEn: 'Classic Watches', slug: 'classic-watches' }
      ]},
      { name: 'حقائب ومحافظ', nameEn: 'Bags & Wallets', slug: 'bags-wallets' },
      { name: 'نظارات شمسية', nameEn: 'Sunglasses', slug: 'sunglasses' }
    ]
  },
  {
    name: 'الرياضة والأنشطة', nameEn: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'معدات اللياقة البدنية', nameEn: 'Fitness Equipment', slug: 'fitness-equipment' },
      { name: 'التخييم والتنزه', nameEn: 'Camping & Hiking', slug: 'camping-hiking' },
      { name: 'ركوب الدراجات', nameEn: 'Cycling', slug: 'cycling' },
      { name: 'السباحة والرياضات المائية', nameEn: 'Water Sports', slug: 'water-sports' }
    ]
  },
  {
    name: 'السيارات', nameEn: 'Automotive', slug: 'automotive', icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'إكسسوارات داخلية', nameEn: 'Interior Accessories', slug: 'car-interior-accessories' },
      { name: 'إلكترونيات السيارات', nameEn: 'Car Electronics', slug: 'car-electronics' },
      { name: 'أدوات ومعدات', nameEn: 'Tools & Equipment', slug: 'car-tools' },
      { name: 'العناية بالسيارة', nameEn: 'Car Care', slug: 'car-care' }
    ]
  }
];

async function deleteEmptyCategories() {
  console.log('Checking for empty categories to delete...');
  // Find all categories that have NO products and NO children that have products
  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true, children: true } } }
  });

  let deletedCount = 0;
  for (const cat of allCategories) {
    // Only delete if zero products
    if (cat._count.products === 0) {
      // Check if it has any children that have products
      const children = await prisma.category.findMany({ where: { parentId: cat.id }, include: { _count: { select: { products: true } } } });
      const hasProductsInChildren = children.some(c => c._count.products > 0);
      if (!hasProductsInChildren) {
        // Delete children first
        for (const child of children) {
          if (child._count.products === 0) {
             await prisma.category.deleteMany({ where: { parentId: child.id, products: { none: {} } } });
             await prisma.category.delete({ where: { id: child.id } }).catch(()=>{});
             deletedCount++;
          }
        }
        await prisma.category.delete({ where: { id: cat.id } }).catch(()=>{});
        deletedCount++;
      }
    }
  }
  console.log(`Cleaned up ${deletedCount} empty categories (Categories with products were preserved).`);
}

async function processCategory(cat, parentId = null, sortOrder = 0) {
  let localImagePath = null;
  if (cat.image) {
    const filename = `${cat.slug}.jpg`;
    const filepath = path.join(__dirname, '..', 'public', 'categories', filename);
    console.log(`Downloading image for ${cat.name}...`);
    localImagePath = await downloadImage(cat.image, filepath);
  }

  console.log(`Upserting category: ${cat.name}`);
  const created = await prisma.category.upsert({
    where: { slug: cat.slug },
    update: {
      name: cat.name,
      nameEn: cat.nameEn,
      icon: cat.icon || null,
      image: localImagePath || null,
      parentId,
      sortOrder
    },
    create: {
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon || null,
      image: localImagePath || null,
      parentId,
      sortOrder
    }
  });

  if (cat.sub && cat.sub.length > 0) {
    for (let i = 0; i < cat.sub.length; i++) {
      await processCategory(cat.sub[i], created.id, i * 10);
    }
  }
  return created;
}

async function addCategoriesToMenu(mainCats) {
  console.log('Adding categories to public_menu...');
  const menuSetting = await prisma.setting.findUnique({ where: { key: 'public_menu' } });
  
  let currentMenu = [];
  if (menuSetting && menuSetting.value) {
    try { currentMenu = JSON.parse(menuSetting.value); } catch(e) {}
  }

  // Generate menu items from main cats
  const newMenuItems = mainCats.map((cat, i) => ({
    id: `cat_${cat.id}`,
    label: cat.name,
    labelEn: cat.nameEn,
    link: `/search?category=${cat.id}`,
    order: i * 10,
    megaMenu: true
  }));

  // Preserve existing non-category menu items (like Home, Contact, etc) if any
  const existingNonCat = currentMenu.filter(m => !m.id || !m.id.startsWith('cat_'));
  
  const finalMenu = [...existingNonCat, ...newMenuItems].sort((a, b) => a.order - b.order);

  await prisma.setting.upsert({
    where: { key: 'public_menu' },
    update: { value: JSON.stringify(finalMenu) },
    create: { key: 'public_menu', value: JSON.stringify(finalMenu), description: 'Main navigation menu' }
  });
  console.log('public_menu updated successfully!');
}

async function main() {
  await deleteEmptyCategories();

  const createdMainCats = [];
  console.log('Starting category processing...');
  for (let i = 0; i < TEMU_CATEGORIES.length; i++) {
    const cat = await processCategory(TEMU_CATEGORIES[i], null, i * 10);
    createdMainCats.push(cat);
  }

  await addCategoriesToMenu(createdMainCats);
  console.log('All done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
