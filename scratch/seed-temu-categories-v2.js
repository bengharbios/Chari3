const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Resolve upload dir just like route.ts
const cwd = process.cwd();
const UPLOAD_DIR = cwd.includes('/domains/') && cwd.includes('/hbuilds/') 
  ? path.join(cwd.substring(0, cwd.indexOf('/hbuilds/')), 'ChariDay_uploads')
  : path.join(cwd, '..', 'ChariDay_uploads');

const downloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = '.jpg';
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `${uniqueId}${ext}`;
    const filepath = path.resolve(UPLOAD_DIR, uniqueFileName);

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`/api/files/${uniqueFileName}`);
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
    oldNames: ['أزياء وملابس'],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'فساتين', nameEn: 'Dresses', slug: 'womens-dresses', sub: [
        { name: 'فساتين صيفية', nameEn: 'Summer Dresses', slug: 'womens-summer-dresses' },
        { name: 'فساتين سهرة', nameEn: 'Evening Dresses', slug: 'womens-evening-dresses' }
      ]},
      { name: 'بلايز وقمصان', nameEn: 'Tops & Shirts', slug: 'womens-tops' },
      { name: 'بناطيل وتنانير', nameEn: 'Bottoms', slug: 'womens-bottoms' },
      { name: 'ملابس رياضية', nameEn: 'Activewear', slug: 'womens-activewear' },
      { name: 'ملابس داخلية ونوم', nameEn: 'Intimates & Sleepwear', slug: 'womens-intimates' },
      { name: 'ملابس مقاسات كبيرة', nameEn: 'Plus Size', slug: 'womens-plus-size' }
    ]
  },
  {
    name: 'ملابس رجالية', nameEn: 'Men\'s Clothing', slug: 'mens-clothing', icon: '👕',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'تيشيرتات وقمصان', nameEn: 'T-Shirts & Shirts', slug: 'mens-shirts' },
      { name: 'بناطيل', nameEn: 'Pants', slug: 'mens-pants' },
      { name: 'جواكت ومعاطف', nameEn: 'Jackets & Coats', slug: 'mens-jackets' },
      { name: 'ملابس رياضية', nameEn: 'Activewear', slug: 'mens-activewear' },
      { name: 'ملابس داخلية', nameEn: 'Underwear', slug: 'mens-underwear' }
    ]
  },
  {
    name: 'الأطفال والرضع', nameEn: 'Kids & Babies', slug: 'kids-babies', icon: '🧸',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'ملابس بناتي', nameEn: 'Girls Clothing', slug: 'girls-clothing' },
      { name: 'ملابس ولادي', nameEn: 'Boys Clothing', slug: 'boys-clothing' },
      { name: 'ملابس الرضع', nameEn: 'Baby Maternity', slug: 'baby-maternity' },
      { name: 'ألعاب', nameEn: 'Toys & Games', slug: 'toys-games' }
    ]
  },
  {
    name: 'الأحذية', nameEn: 'Shoes', slug: 'shoes', icon: '👟',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'أحذية نسائية', nameEn: 'Women\'s Shoes', slug: 'womens-shoes' },
      { name: 'أحذية رجالية', nameEn: 'Men\'s Shoes', slug: 'mens-shoes' },
      { name: 'أحذية رياضية', nameEn: 'Sneakers', slug: 'sneakers' },
      { name: 'أحذية أطفال', nameEn: 'Kids Shoes', slug: 'kids-shoes' }
    ]
  },
  {
    name: 'الجمال والصحة', nameEn: 'Beauty & Health', slug: 'beauty-health', icon: '💄',
    oldNames: ['جمال وعناية'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'مكياج', nameEn: 'Makeup', slug: 'makeup' },
      { name: 'العناية بالبشرة', nameEn: 'Skincare', slug: 'skincare' },
      { name: 'العناية بالشعر', nameEn: 'Hair Care', slug: 'hair-care' },
      { name: 'عطور', nameEn: 'Fragrances', slug: 'fragrances' },
      { name: 'أدوات العناية الشخصية', nameEn: 'Personal Care Appliances', slug: 'personal-care-appliances' }
    ]
  },
  {
    name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'ديكور المنزل', nameEn: 'Home Decor', slug: 'home-decor' },
      { name: 'أدوات المطبخ', nameEn: 'Kitchenware', slug: 'kitchenware' },
      { name: 'مفروشات السرير', nameEn: 'Bedding', slug: 'bedding' },
      { name: 'تخزين وتنظيم', nameEn: 'Storage & Organization', slug: 'storage-organization' },
      { name: 'أثاث خفيف', nameEn: 'Light Furniture', slug: 'light-furniture' }
    ]
  },
  {
    name: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'هواتف ذكية وإكسسوارات', nameEn: 'Phones & Accessories', slug: 'phones-accessories' },
      { name: 'صوتيات وسماعات', nameEn: 'Audio & Headphones', slug: 'audio-headphones' },
      { name: 'أجهزة كمبيوتر', nameEn: 'Computers', slug: 'computers' },
      { name: 'المنزل الذكي', nameEn: 'Smart Home', slug: 'smart-home' },
      { name: 'ألعاب فيديو', nameEn: 'Video Games', slug: 'video-games' }
    ]
  },
  {
    name: 'المجوهرات والإكسسوارات', nameEn: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: '💍',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'مجوهرات نسائية', nameEn: 'Women\'s Jewelry', slug: 'womens-jewelry' },
      { name: 'ساعات', nameEn: 'Watches', slug: 'watches' },
      { name: 'حقائب ومحافظ', nameEn: 'Bags & Wallets', slug: 'bags-wallets' },
      { name: 'نظارات شمسية', nameEn: 'Sunglasses', slug: 'sunglasses' }
    ]
  },
  {
    name: 'الرياضة والأنشطة', nameEn: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽',
    oldNames: ['رياضة ولياقة'],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'معدات اللياقة', nameEn: 'Fitness Equipment', slug: 'fitness-equipment' },
      { name: 'التخييم والتنزه', nameEn: 'Camping & Hiking', slug: 'camping-hiking' },
      { name: 'رياضات مائية', nameEn: 'Water Sports', slug: 'water-sports' }
    ]
  },
  {
    name: 'السيارات', nameEn: 'Automotive', slug: 'automotive', icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'إكسسوارات داخلية', nameEn: 'Interior Accessories', slug: 'car-interior-accessories' },
      { name: 'إلكترونيات السيارات', nameEn: 'Car Electronics', slug: 'car-electronics' },
      { name: 'أدوات ومعدات', nameEn: 'Tools & Equipment', slug: 'car-tools' }
    ]
  },
  {
    name: 'الأجهزة المنزلية', nameEn: 'Appliances', slug: 'appliances', icon: '🔌',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'أجهزة صغيرة', nameEn: 'Small Appliances', slug: 'small-appliances' },
      { name: 'مكانس كهربائية', nameEn: 'Vacuums', slug: 'vacuums' }
    ]
  },
  {
    name: 'مستلزمات الحيوانات الأليفة', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'للكلاب', nameEn: 'Dogs', slug: 'dogs' },
      { name: 'للقطط', nameEn: 'Cats', slug: 'cats' }
    ]
  },
  {
    name: 'اللوازم المكتبية والمدرسية', nameEn: 'Office & School', slug: 'office-school', icon: '📚',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'أقلام وورق', nameEn: 'Pens & Paper', slug: 'pens-paper' },
      { name: 'حقائب مدرسية', nameEn: 'School Bags', slug: 'school-bags' }
    ]
  },
  {
    name: 'الأعمال والصناعة', nameEn: 'Industrial & Commercial', slug: 'industrial-commercial', icon: '⚙️',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    sub: [
      { name: 'معدات السلامة', nameEn: 'Safety Equipment', slug: 'safety-equipment' },
      { name: 'أدوات مهنية', nameEn: 'Professional Tools', slug: 'professional-tools' }
    ]
  }
];

async function processCategory(cat, parentId = null, sortOrder = 0) {
  let localImagePath = null;
  if (cat.image) {
    console.log(`Downloading image for ${cat.name}...`);
    localImagePath = await downloadImage(cat.image);
  }

  // Simple upsert by slug to avoid duplication
  console.log(`Upserting category: ${cat.name}`);
  const created = await prisma.category.upsert({
    where: { slug: cat.slug },
    update: {
      name: cat.name,
      nameEn: cat.nameEn,
      icon: cat.icon || null,
      ...(localImagePath && { image: localImagePath }),
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

  const newMenuItems = mainCats.map((cat, i) => ({
    id: `cat_${cat.id}`,
    label: cat.name,
    labelEn: cat.nameEn,
    link: `/search?category=${cat.id}`,
    order: i * 10,
    megaMenu: true
  }));

  const existingNonCat = currentMenu.filter(m => !m.id || !m.id.startsWith('cat_'));
  const finalMenu = [...existingNonCat, ...newMenuItems].sort((a, b) => a.order - b.order);

  await prisma.setting.upsert({
    where: { key: 'public_menu' },
    update: { value: JSON.stringify(finalMenu) },
    create: { key: 'public_menu', value: JSON.stringify(finalMenu) }
  });
  console.log('public_menu updated successfully!');
}

async function main() {
  const createdMainCats = [];
  console.log('Starting category processing (V2)...');
  for (let i = 0; i < TEMU_CATEGORIES.length; i++) {
    const cat = await processCategory(TEMU_CATEGORIES[i], null, i * 10);
    createdMainCats.push(cat);
  }

  await addCategoriesToMenu(createdMainCats);
  console.log('All done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
