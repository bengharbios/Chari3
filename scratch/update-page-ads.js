const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin-secure-internal/settings/homepage/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const [allAds, setAllAds]')) {
  // 1. Add State
  content = content.replace(
    /const \[allSellers, setAllSellers\] = useState<any\[\]>\(\[\]\);/,
    `const [allSellers, setAllSellers] = useState<any[]>([]);\n  const [allAds, setAllAds] = useState<Record<string, any[]>>({});`
  );

  // 2. Set state in fetchHomepageConfig
  content = content.replace(
    /if \(sellerData\.sellers\) setAllSellers\(sellerData\.sellers\);/,
    `if (sellerData.sellers) setAllSellers(sellerData.sellers);\n      if (d.advertisements) setAllAds(d.advertisements);`
  );

  // 3. Render Ad Preview in ad_zone settings
  const adPreviewInjection = `
                          <div className="mt-4 border border-border/50 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <Label className="text-xs font-bold text-slate-500 mb-2 block">{t('معاينة إعلانات المنطقة', 'Zone Ads Preview')}</Label>
                            {allAds[editSectData.metadata?.adZone || 'banner_mid']?.length > 0 ? (
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {allAds[editSectData.metadata?.adZone || 'banner_mid'].map((ad: any) => (
                                  <div key={ad.id} className="relative shrink-0 border border-border rounded-lg overflow-hidden group w-40 h-20">
                                    <img src={isAr ? (ad.imageArUrl || ad.imageEnUrl) : (ad.imageEnUrl || ad.imageArUrl)} alt="ad preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                      <p className="text-[9px] text-white font-mono break-all">{ad.linkUrl}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic text-center py-4 bg-background rounded-lg border border-dashed border-border">
                                {t('لا توجد إعلانات نشطة في هذه المنطقة', 'No active ads in this zone')}
                              </p>
                            )}
                          </div>
`;

  content = content.replace(
    /<\/select>\n\s*<\/div>\n\s*\)}/,
    `</select>\n${adPreviewInjection}                        </div>\n                      )}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully injected ad preview logic');
} else {
  console.log('Already injected ad preview logic');
}
