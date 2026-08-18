const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'categories');

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
          resolve(`/categories/${uniqueFileName}`);
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
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'ملابس رجالية', nameEn: 'Men\'s Clothing', slug: 'mens-clothing', icon: '👕',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الأطفال والرضع', nameEn: 'Kids & Babies', slug: 'kids-babies', icon: '🧸',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الأحذية', nameEn: 'Shoes', slug: 'shoes', icon: '👟',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الجمال والصحة', nameEn: 'Beauty & Health', slug: 'beauty-health', icon: '💄',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'المنزل والمطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'المجوهرات والإكسسوارات', nameEn: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: '💍',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الرياضة والأنشطة', nameEn: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'السيارات', nameEn: 'Automotive', slug: 'automotive', icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الأجهزة المنزلية', nameEn: 'Appliances', slug: 'appliances', icon: '🔌',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'مستلزمات الحيوانات الأليفة', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'اللوازم المكتبية والمدرسية', nameEn: 'Office & School', slug: 'office-school', icon: '📚',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'الأعمال والصناعة', nameEn: 'Industrial & Commercial', slug: 'industrial-commercial', icon: '⚙️',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  }
];

async function main() {
  console.log('Starting category image updates (V3)...');
  for (const cat of TEMU_CATEGORIES) {
    if (cat.image) {
      const localPath = await downloadImage(cat.image);
      if (localPath) {
        console.log(`Updated ${cat.name} with ${localPath}`);
        await prisma.category.updateMany({
          where: { slug: cat.slug },
          data: { image: localPath }
        });
      }
    }
  }

  // Update public_menu
  const menuSetting = await prisma.setting.findUnique({ where: { key: 'public_menu' } });
  if (menuSetting && menuSetting.value) {
    let currentMenu = JSON.parse(menuSetting.value);
    let updated = false;
    
    // We don't really need to update public_menu items because direct-category dropdowns 
    // fetch the category details from the DB categories dynamically in the frontend component 
    // (categories.find(c => c.id === item.categoryId)). But we'll save just in case.
  }
  
  console.log('All done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
