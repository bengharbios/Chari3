const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, '../src/app/api/admin/homepage/route.ts');
let routeContent = fs.readFileSync(routePath, 'utf8');

// Update the Promise.all array
routeContent = routeContent.replace(
  /const \[layoutSetting, pinnedSetting, countdownSetting, heroSlidesSetting\] = await Promise\.all\(\[\n\s*db\.setting\.findUnique\(\{ where: \{ key: 'homepage_layout' \} \}\),\n\s*db\.setting\.findUnique\(\{ where: \{ key: 'homepage_pinned_items' \} \}\),\n\s*db\.setting\.findUnique\(\{ where: \{ key: 'homepage_countdown' \} \}\),\n\s*db\.setting\.findUnique\(\{ where: \{ key: 'homepage_hero_slides' \} \}\),\n\s*\]\);/,
  `const [layoutSetting, pinnedSetting, countdownSetting, heroSlidesSetting, adsResult] = await Promise.all([\n      db.setting.findUnique({ where: { key: 'homepage_layout' } }),\n      db.setting.findUnique({ where: { key: 'homepage_pinned_items' } }),\n      db.setting.findUnique({ where: { key: 'homepage_countdown' } }),\n      db.setting.findUnique({ where: { key: 'homepage_hero_slides' } }),\n      db.advertisement.findMany({ orderBy: [{ zone: 'asc' }, { sortOrder: 'asc' }] }),\n    ]);`
);

// Group the ads
const adsGroupingCode = `
    const adsByZone: Record<string, any[]> = {};
    if (adsResult) {
      for (const ad of adsResult) {
        if (!adsByZone[ad.zone]) adsByZone[ad.zone] = [];
        adsByZone[ad.zone].push(ad);
      }
    }
`;

routeContent = routeContent.replace(
  /const heroSlides = heroSlidesSetting\?\.value \? JSON\.parse\(heroSlidesSetting\.value\) : \[\];/,
  `const heroSlides = heroSlidesSetting?.value ? JSON.parse(heroSlidesSetting.value) : [];\n${adsGroupingCode}`
);

routeContent = routeContent.replace(
  /heroSlides,\n\s*\}\);/,
  `heroSlides,\n      advertisements: adsByZone,\n    });`
);

fs.writeFileSync(routePath, routeContent, 'utf8');
console.log('Homepage API updated successfully');
