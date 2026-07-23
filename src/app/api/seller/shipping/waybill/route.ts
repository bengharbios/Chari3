import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { tafqeetCurrency } from '@/lib/utils/tafqeet';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function numberToWordsEn(amount: number, currency = 'DZD'): string {
  const integerPart = Math.floor(Math.abs(amount));
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
  }

  if (integerPart === 0) return `Zero ${currency}`;

  let result = '';
  const thousands = Math.floor(integerPart / 1000);
  const remainder = integerPart % 1000;

  if (thousands > 0) {
    result += convertGroup(thousands) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertGroup(remainder);
  }

  return result.trim() + ' ' + currency;
}

function numberToWordsFr(amount: number, currency = 'Dinars Algériens'): string {
  const integerPart = Math.floor(Math.abs(amount));
  const ones = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-Sept', 'Dix-Huit', 'Dix-Neuf'];
  const tens = ['', '', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-Dix', 'Quatre-Vingts', 'Quatre-Vingt-Dix'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    return (Math.floor(n / 100) === 1 ? 'Cent' : ones[Math.floor(n / 100)] + ' Cents') + (n % 100 ? ' ' + convertGroup(n % 100) : '');
  }

  if (integerPart === 0) return `Zéro ${currency}`;

  let result = '';
  const thousands = Math.floor(integerPart / 1000);
  const remainder = integerPart % 1000;

  if (thousands > 0) {
    result += (thousands === 1 ? 'Mille' : convertGroup(thousands) + ' Mille') + ' ';
  }
  if (remainder > 0) {
    result += convertGroup(remainder);
  }

  return result.trim() + ' ' + currency;
}

// Standard Code128-B Patterns (0 to 106)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "202121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function generateCode128SVG(text: string): string {
  if (!text) return '';
  const cleanText = text.trim();
  let checksum = 104; // Start Code B
  const patternIndices = [104];

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      patternIndices.push(code);
      checksum += code * (i + 1);
    }
  }

  const checksumIndex = checksum % 103;
  patternIndices.push(checksumIndex);
  patternIndices.push(106); // Stop symbol

  const symbolString = patternIndices.map(idx => CODE128_PATTERNS[idx] || '111111').join('');

  let x = 10;
  const quietZone = 10;
  const height = 42;
  const moduleWidth = 1.6;

  let rects = '';
  let isBar = true;

  for (let i = 0; i < symbolString.length; i++) {
    const w = parseInt(symbolString[i], 10) * moduleWidth;
    if (isBar) {
      rects += `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="#000"/>`;
    }
    x += w;
    isBar = !isBar;
  }

  const totalWidth = x + quietZone;

  return `<svg viewBox="0 0 ${totalWidth.toFixed(1)} ${height}" width="90%" height="${height}px" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:0 auto;">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${rects}
  </svg>`;
}

async function getResolvedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = await getSession(await headers());
    if (session?.user?.id) return session.user.id;

    const headerObj = await headers();
    const cookieHeader = headerObj.get('cookie') || req?.headers?.get('cookie') || '';
    const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/) ||
                  cookieHeader.match(/session_token=([^;]+)/) ||
                  cookieHeader.match(/auth_token=([^;]+)/);
    
    if (match && match[1]) {
      const rawToken = decodeURIComponent(match[1]);
      const token = rawToken.split('.')[0];
      const dbSession = await db.session.findFirst({
        where: {
          OR: [
            { token: rawToken },
            { token: token },
            { id: token },
          ],
          expiresAt: { gt: new Date() },
        },
        select: { userId: true },
      });
      if (dbSession?.userId) return dbSession.userId;
    }
  } catch (err) {
    console.error('[getResolvedUserId-waybill-error]', err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const tracking = searchParams.get('tracking');
    const lang = searchParams.get('lang') || 'ar';
    const secretKey = searchParams.get('key');

    let order: any = null;

    if (orderId) {
      order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: { store: true },
              },
            },
          },
          buyer: true,
        },
      });
    } else if (tracking) {
      const orderNumMatch = tracking.replace(/^DZ-[A-Z]+-/, '');
      order = await db.order.findFirst({
        where: {
          OR: [
            { orderNumber: { contains: orderNumMatch } },
            { id: tracking },
          ],
        },
        include: {
          items: {
            include: {
              product: {
                include: { store: true },
              },
            },
          },
          buyer: true,
        },
      });
    }

    if (!order) {
      return new NextResponse(`
        <html dir="rtl"><body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>⚠️ لم يتم العثور على بيانات الطلب أو بوليصة الشحن</h2>
          <p>يرجى التأكد من اختيار طلب صحيح من لوحة التاجر.</p>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 });
    }

    // 🔒 Security Authorization Check
    const userId = await getResolvedUserId(req);
    let isAuthorized = false;

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      // Super admin or logistics agent
      if (user?.role === 'super_admin' || user?.role === 'logistics' || user?.role === 'store') {
        isAuthorized = true;
      }
      // Buyer of the order
      if (order.buyerId === userId) {
        isAuthorized = true;
      }
      // Store owner/manager/staff
      const storeId = order.items?.[0]?.product?.storeId;
      if (storeId) {
        const store = await db.store.findFirst({
          where: {
            id: storeId,
            OR: [
              { managerId: userId },
              { ownerId: userId },
            ],
          },
        });
        if (store) isAuthorized = true;
      }
    }

    // Pass via secret print key fallback if shared intentionally by seller
    if (secretKey && secretKey === order.id.slice(-8)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return new NextResponse(`
        <html dir="rtl"><body style="font-family:sans-serif; text-align:center; padding:50px; background:#f9fafb;">
          <div style="max-width:500px; margin:0 auto; background:#fff; padding:30px; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <div style="font-size:40px; margin-bottom:12px;">🔒</div>
            <h2 style="color:#111827; font-size:20px; font-weight:900;">وصول غير مصرح به للبوليصة</h2>
            <p style="color:#6b7280; font-size:14px; line-height:1.5;">لحماية بيانات المشتري والتاجر، هذه البوليصة محمية بأعلى معايير الأمان. يرجى تسجيل الدخول إلى لوحة التاجر للوصول إليها وطباعتها.</p>
            <a href="/login" style="display:inline-block; margin-top:16px; padding:10px 24px; background:#000; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:13px;">تسجيل الدخول إلى اللوحة</a>
          </div>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 403 });
    }

    // Extract Multilingual Store Info
    const firstProductStore = order.items?.[0]?.product?.store;
    let storeName = 'متجر رانيا (ChariDay Merchant)';
    if (firstProductStore) {
      if ((lang === 'en' || lang === 'fr') && firstProductStore.nameEn) {
        storeName = firstProductStore.nameEn;
      } else {
        storeName = firstProductStore.name || 'متجر رانيا';
      }
    }
    const storePhone = firstProductStore?.phone || firstProductStore?.contactPhone || '0555-00-00-00';
    const storeAddress = firstProductStore?.address || 'الجزائر العاصمة';

    // Extract Order Data
    const orderNum = order.orderNumber || `CHARI-${(order.id || '').substring(0, 8)}`;
    const trackingNo = tracking || `DZ-CDX-${orderNum.replace(/[^A-Z0-9]/gi, '').slice(-10)}`;

    // Buyer & Address Parsing
    let buyerName = order.buyer?.name || 'زبون المنصة';
    let buyerPhone = order.buyer?.phone || '';
    let buyerPhone2 = '';

    let rawAddr = order.shippingAddress || order.address || {};
    let shippingAddr: any = {};

    for (let i = 0; i < 3; i++) {
      if (typeof rawAddr === 'string') {
        try {
          rawAddr = JSON.parse(rawAddr);
        } catch (e) {
          break;
        }
      }
    }
    if (typeof rawAddr === 'object' && rawAddr !== null) {
      shippingAddr = rawAddr;
    } else if (typeof rawAddr === 'string') {
      shippingAddr = { street: rawAddr };
    }

    if (shippingAddr.fullName) buyerName = shippingAddr.fullName;
    if (shippingAddr.phone) buyerPhone = shippingAddr.phone;
    if (shippingAddr.phoneNumber) buyerPhone = shippingAddr.phoneNumber;
    if (shippingAddr.secondaryPhone) buyerPhone2 = shippingAddr.secondaryPhone;

    if (!buyerPhone || buyerPhone === 'غير مدخل') {
      buyerPhone = order.buyer?.phone || '0550-00-00-00';
    }

    // 58 Algerian Wilayas Map
    const wilayaMap: Record<string, { ar: string; en: string; fr: string }> = {
      '1': { ar: '01 - أدرار', en: '01 - Adrar', fr: '01 - Adrar' },
      '2': { ar: '02 - الشلف', en: '02 - Chlef', fr: '02 - Chlef' },
      '3': { ar: '03 - الأغواط', en: '03 - Laghouat', fr: '03 - Laghouat' },
      '4': { ar: '04 - أم البواقي', en: '04 - Oum El Bouaghi', fr: '04 - Oum El Bouaghi' },
      '5': { ar: '05 - باتنة', en: '05 - Batna', fr: '05 - Batna' },
      '6': { ar: '06 - بجاية', en: '06 - Béjaïa', fr: '06 - Béjaïa' },
      '7': { ar: '07 - بسكرة', en: '07 - Biskra', fr: '07 - Biskra' },
      '8': { ar: '08 - بشار', en: '08 - Béchar', fr: '08 - Béchar' },
      '9': { ar: '09 - البليدة', en: '09 - Blida', fr: '09 - Blida' },
      '10': { ar: '10 - البويرة', en: '10 - Bouira', fr: '10 - Bouira' },
      '11': { ar: '11 - تمنراست', en: '11 - Tamanrasset', fr: '11 - Tamanrasset' },
      '12': { ar: '12 - تبسة', en: '12 - Tébessa', fr: '12 - Tébessa' },
      '13': { ar: '13 - تلمسان', en: '13 - Tlemcen', fr: '13 - Tlemcen' },
      '14': { ar: '14 - تيارت', en: '14 - Tiaret', fr: '14 - Tiaret' },
      '15': { ar: '15 - تيزي وزو', en: '15 - Tizi Ouzou', fr: '15 - Tizi Ouzou' },
      '16': { ar: '16 - الجزائر', en: '16 - Algiers', fr: '16 - Alger' },
      '17': { ar: '17 - الجلفة', en: '17 - Djelfa', fr: '17 - Djelfa' },
      '18': { ar: '18 - جيجل', en: '18 - Jijel', fr: '18 - Jijel' },
      '19': { ar: '19 - سطيف', en: '19 - Sétif', fr: '19 - Sétif' },
      '20': { ar: '20 - سعيدة', en: '20 - Saïda', fr: '20 - Saïda' },
      '21': { ar: '21 - سكيكدة', en: '21 - Skikda', fr: '21 - Skikda' },
      '22': { ar: '22 - سيدي بلعباس', en: '22 - Sidi Bel Abbès', fr: '22 - Sidi Bel Abbès' },
      '23': { ar: '23 - عنابة', en: '23 - Annaba', fr: '23 - Annaba' },
      '24': { ar: '24 - قالة', en: '24 - Guelma', fr: '24 - Guelma' },
      '25': { ar: '25 - قسنطينة', en: '25 - Constantine', fr: '25 - Constantine' },
      '26': { ar: '26 - المدية', en: '26 - Médéa', fr: '26 - Médéa' },
      '27': { ar: '27 - مستغانم', en: '27 - Mostaganem', fr: '27 - Mostaganem' },
      '28': { ar: '28 - المسيلة', en: '28 - M\'Sila', fr: '28 - M\'Sila' },
      '29': { ar: '29 - معسكر', en: '29 - Mascara', fr: '29 - Mascara' },
      '30': { ar: '30 - ورقلة', en: '30 - Ouargla', fr: '30 - Ouargla' },
      '31': { ar: '31 - وهران', en: '31 - Oran', fr: '31 - Oran' },
      '32': { ar: '32 - البيض', en: '32 - El Bayadh', fr: '32 - El Bayadh' },
      '33': { ar: '33 - إليزي', en: '33 - Illizi', fr: '33 - Illizi' },
      '34': { ar: '34 - برج بوعريريج', en: '34 - Bordj Bou Arréridj', fr: '34 - Bordj Bou Arréridj' },
      '35': { ar: '35 - بومرداس', en: '35 - Boumerdès', fr: '35 - Boumerdès' },
      '36': { ar: '36 - الطارف', en: '36 - El Tarf', fr: '36 - El Tarf' },
      '37': { ar: '37 - تندوف', en: '37 - Tindouf', fr: '37 - Tindouf' },
      '38': { ar: '38 - تسمسيلت', en: '38 - Tissemsilt', fr: '38 - Tissemsilt' },
      '39': { ar: '39 - الوادي', en: '39 - El Oued', fr: '39 - El Oued' },
      '40': { ar: '40 - خنشلة', en: '40 - Khenchela', fr: '40 - Khenchela' },
      '41': { ar: '41 - سوق أهراس', en: '41 - Souk Ahras', fr: '41 - Souk Ahras' },
      '42': { ar: '42 - تيبازة', en: '42 - Tipaza', fr: '42 - Tipaza' },
      '43': { ar: '43 - ميلة', en: '43 - Mila', fr: '43 - Mila' },
      '44': { ar: '44 - عين الدفلى', en: '44 - Aïn Defla', fr: '44 - Aïn Defla' },
      '45': { ar: '45 - النعامة', en: '45 - Naâma', fr: '45 - Naâma' },
      '46': { ar: '46 - عين تموشنت', en: '46 - Aïn Témouchent', fr: '46 - Aïn Témouchent' },
      '47': { ar: '47 - غرداية', en: '47 - Ghardaïa', fr: '47 - Ghardaïa' },
      '48': { ar: '48 - غليزان', en: '48 - Relizane', fr: '48 - Relizane' },
      '49': { ar: '49 - التيميمون', en: '49 - Timimoun', fr: '49 - Timimoun' },
      '50': { ar: '50 - برج باجي مختار', en: '50 - Bordj Badji Mokhtar', fr: '50 - Bordj Badji Mokhtar' },
      '51': { ar: '51 - أولاد جلال', en: '51 - Ouled Djellal', fr: '51 - Ouled Djellal' },
      '52': { ar: '52 - بني عباس', en: '52 - Béni Abbès', fr: '52 - Béni Abbès' },
      '53': { ar: '53 - إن صالح', en: '53 - In Salah', fr: '53 - In Salah' },
      '54': { ar: '54 - إن قزام', en: '54 - In Guezzam', fr: '54 - In Guezzam' },
      '55': { ar: '55 - تقرت', en: '55 - Touggourt', fr: '55 - Touggourt' },
      '56': { ar: '56 - جانت', en: '56 - Djanet', fr: '56 - Djanet' },
      '57': { ar: '57 - المغير', en: '57 - El M\'Ghair', fr: '57 - El M\'Ghair' },
      '58': { ar: '58 - المنيعة', en: '58 - El Meniaa', fr: '58 - El Meniaa' }
    };

    const wilayaCode = String(shippingAddr.wilayaCode || shippingAddr.wilaya || shippingAddr.state || '16');
    const wInfo = wilayaMap[wilayaCode] || { ar: '16 - الجزائر', en: '16 - Algiers', fr: '16 - Alger' };
    const wilaya = lang === 'en' ? wInfo.en : (lang === 'fr' ? wInfo.fr : wInfo.ar);
    
    let commune = shippingAddr.commune || shippingAddr.city || (lang === 'en' ? 'City Center' : (lang === 'fr' ? 'Centre-Ville' : 'وسط المدينة'));
    if (/^c[a-z0-9]{15,}$/i.test(commune)) {
      commune = lang === 'en' ? 'City Center' : (lang === 'fr' ? 'Centre-Ville' : 'وسط المدينة');
    }

    let fullStreetAddress = shippingAddr.street || shippingAddr.address || shippingAddr.fullAddress || '';
    if (!fullStreetAddress || typeof fullStreetAddress !== 'string' || fullStreetAddress.trim().startsWith('{')) {
      fullStreetAddress = lang === 'en' ? 'Detailed address on order' : (lang === 'fr' ? 'Adresse détaillée sur commande' : 'العنوان التفصيلي مسجل بالطلب');
    }

    // Global Warehouse Specifications (Weight, Payment Mode, SKU)
    const items = Array.isArray(order.items) ? order.items : [];
    let calculatedWeight = 0;
    items.forEach((it: any) => {
      const w = it.product?.weight || 0.4;
      calculatedWeight += w * (it.quantity || 1);
    });
    const totalWeightStr = `${calculatedWeight.toFixed(2)} kg`;

    const isCod = (order.paymentMethod || 'cod').toLowerCase() === 'cod';
    const totalAmount = order.total || order.totalAmount || 0;

    // Multi-language Dictionaries
    const tDict: Record<string, any> = {
      ar: {
        pageTitle: `بوليصة شحن حرارية - ${trackingNo}`,
        dir: 'rtl',
        brandSub: 'محرك الشحن والتوصيل الموحد',
        deliveryHome: 'توصيل للمنزل 🏠',
        deliveryOffice: 'تسليم بالمكتب 🏢',
        orderNumLabel: 'رقم الطلب:',
        dateLabel: 'التاريخ:',
        senderTitle: 'المرسل (FROM):',
        recipientTitle: 'المستلم (TO):',
        fragile: '🍷 قابل للكسر (Fragile)',
        inspection: '⚡ مسموح الفحص قبل الدفع',
        exchange: '🔄 قابل للتبديل',
        productCol: 'المنتج والرمز (SKU)',
        qtyCol: 'الكمية',
        totalCol: 'السعر الإجمالي',
        freeItem: 'طرد منتجات متجر رانيا',
        codHeader: isCod ? 'المبلغ الصافي المطلوب تحصيله (COD AMOUNT):' : 'حالة الدفع (PAYMENT STATUS):',
        codText: isCod ? `${totalAmount.toLocaleString()} د.ج` : 'تم الدفع أونلاين بالكامل ✅ (لا يُحصّل مبلغ)',
        onlyPrefix: 'فقط:',
        footerNotice: 'طبع عبر منصة ChariDay الرقمية | بوليصة رسمية معتمدة',
        issueDate: 'تاريخ الإصدار:',
        signature: 'توقيع وختم المستلم',
        phoneNotProvided: 'غير مدخل',
        weightLabel: 'الوزن الكلي:',
        paymentBadge: isCod ? 'الدفع عند الاستلام 💵' : 'مدفوع أونلاين 💳',
      },
      en: {
        pageTitle: `Thermal Waybill Label - ${trackingNo}`,
        dir: 'ltr',
        brandSub: 'Unified Shipping & Logistics Engine',
        deliveryHome: 'Home Delivery 🏠',
        deliveryOffice: 'Office Pickup 🏢',
        orderNumLabel: 'Order #:',
        dateLabel: 'Date:',
        senderTitle: 'SENDER (FROM):',
        recipientTitle: 'RECIPIENT (TO):',
        fragile: '🍷 Fragile',
        inspection: '⚡ Inspection Allowed',
        exchange: '🔄 Exchangeable',
        productCol: 'Item & SKU',
        qtyCol: 'Qty',
        totalCol: 'Total Price',
        freeItem: 'Merchant Product Parcel',
        codHeader: isCod ? 'Net Amount to Collect (COD AMOUNT):' : 'PAYMENT STATUS:',
        codText: isCod ? `${totalAmount.toLocaleString()} DZD` : 'PAID ONLINE IN FULL ✅ (DO NOT COLLECT CASH)',
        onlyPrefix: 'Only:',
        footerNotice: 'Printed via ChariDay Digital Platform | Certified Waybill',
        issueDate: 'Issue Date:',
        signature: 'Recipient Signature & Stamp',
        phoneNotProvided: 'Not Provided',
        weightLabel: 'Total Weight:',
        paymentBadge: isCod ? 'Pay on Delivery 💵' : 'Paid Online 💳',
      },
      fr: {
        pageTitle: `Bordereau d'Expédition - ${trackingNo}`,
        dir: 'ltr',
        brandSub: 'Moteur de Livraison & Logistique',
        deliveryHome: 'Livraison à Domicile 🏠',
        deliveryOffice: 'Retrait en Bureau 🏢',
        orderNumLabel: 'Commande N°:',
        dateLabel: 'Date:',
        senderTitle: 'EXPÉDITEUR (DE):',
        recipientTitle: 'DESTINATAIRE (À):',
        fragile: '🍷 Fragile',
        inspection: '⚡ Inspection Autorisée',
        exchange: '🔄 Échangeable',
        productCol: 'Article & SKU',
        qtyCol: 'Qté',
        totalCol: 'Prix Total',
        freeItem: 'Colis Produits Marchand',
        codHeader: isCod ? 'Montant Net à Encaisser (COD AMOUNT):' : 'STATUT DE PAIEMENT:',
        codText: isCod ? `${totalAmount.toLocaleString()} DZD` : 'PAYÉ EN LIGNE ✅ (NE PAS ENCAISSER DE CASH)',
        onlyPrefix: 'Seulement:',
        footerNotice: 'Imprimé via la Plateforme ChariDay | Bordereau Officiel',
        issueDate: "Date d'Émission:",
        signature: 'Signature & Cachet Destinataire',
        phoneNotProvided: 'Non Fourni',
        weightLabel: 'Poids Total:',
        paymentBadge: isCod ? 'Paiement à la Livraison 💵' : 'Payé en Ligne 💳',
      },
    };

    const dict = tDict[lang] || tDict.ar;

    let tafqeetText = '';
    if (isCod) {
      if (lang === 'en') {
        tafqeetText = numberToWordsEn(totalAmount, 'DZD');
      } else if (lang === 'fr') {
        tafqeetText = numberToWordsFr(totalAmount, 'Dinars Algériens');
      } else {
        tafqeetText = tafqeetCurrency(totalAmount, 'DZD');
      }
    }

    const createdDate = new Date(order.createdAt || Date.now()).toLocaleDateString(lang === 'en' ? 'en-US' : (lang === 'fr' ? 'fr-FR' : 'ar-DZ'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isHomeDelivery = true;
    const barcodeSvg = generateCode128SVG(trackingNo);

    // Standard Industry A6 Thermal Bill of Lading HTML/CSS
    const htmlContent = `
<!DOCTYPE html>
<html dir="${dict.dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${dict.pageTitle}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 8mm;
      width: 100mm;
      height: 150mm;
      background: #fff;
      color: #000;
      font-size: 11px;
      line-height: 1.2;
    }
    .wrapper {
      border: 2px solid #000;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 6px;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 8px;
      font-weight: bold;
      color: #333;
    }
    .badge {
      border: 1.5px solid #000;
      padding: 2px 6px;
      font-size: 9px;
      font-weight: 900;
      background: #000;
      color: #fff;
      border-radius: 3px;
    }
    .barcode-container {
      text-align: center;
      padding: 6px 0;
      border-bottom: 1px solid #000;
      background: #fafafa;
    }
    .tracking-code {
      font-family: monospace;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      border-bottom: 1px solid #000;
      padding: 4px 0;
    }
    .box {
      border: 1px solid #000;
      padding: 4px;
      border-radius: 4px;
    }
    .box-title {
      font-size: 8px;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 1px solid #ddd;
      padding-bottom: 2px;
      margin-bottom: 3px;
      color: #444;
    }
    .val-bold {
      font-size: 11px;
      font-weight: 900;
    }
    .val-sub {
      font-size: 9.5px;
      color: #222;
    }
    .address-box {
      border-bottom: 1.5px solid #000;
      padding: 5px 0;
    }
    .wilaya-badge {
      display: inline-block;
      background: #000;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 3px;
      margin-bottom: 3px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
      font-size: 9px;
    }
    .items-table th, .items-table td {
      border: 1px solid #000;
      padding: 2px 4px;
      text-align: ${dict.dir === 'rtl' ? 'right' : 'left'};
    }
    .items-table th {
      background: #eee;
      font-weight: 900;
    }
    .cod-box {
      border: 2px solid #000;
      background: #f8f8f8;
      padding: 6px;
      text-align: center;
      margin-top: 4px;
      border-radius: 4px;
    }
    .cod-amount {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .tafqeet-line {
      font-size: 9px;
      font-weight: bold;
      margin-top: 2px;
      color: #222;
    }
    .flags-row {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-weight: bold;
      border-top: 1px solid #000;
      padding-top: 3px;
      margin-top: 4px;
    }
    .footer-stamp {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 7.5px;
      color: #555;
      padding-top: 3px;
    }
    .sign-box {
      border: 1px dashed #666;
      width: 80px;
      height: 25px;
      text-align: center;
      line-height: 25px;
      font-size: 7px;
      color: #888;
    }
    @media print {
      body { padding: 0; }
      .wrapper { border: 2px solid #000; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Multi-Language Quick Selector Bar (Hidden on Thermal Printing) -->
  <div class="no-print" style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:12px; background:#f3f4f6; padding:8px 12px; border-radius:8px; border:1px solid #e5e7eb; font-family:sans-serif; font-size:12px;">
    <span style="font-weight:bold; color:#374151;">🌐 اختر لغة طباعة البوليصة (Select Language):</span>
    <a href="?orderId=${order?.id || ''}&tracking=${tracking || ''}&lang=ar" style="padding:4px 10px; background:${lang === 'ar' ? '#000' : '#fff'}; color:${lang === 'ar' ? '#fff' : '#000'}; border:1px solid #000; border-radius:4px; text-decoration:none; font-weight:bold;">🇩🇿 العربية</a>
    <a href="?orderId=${order?.id || ''}&tracking=${tracking || ''}&lang=en" style="padding:4px 10px; background:${lang === 'en' ? '#000' : '#fff'}; color:${lang === 'en' ? '#fff' : '#000'}; border:1px solid #000; border-radius:4px; text-decoration:none; font-weight:bold;">🇬🇧 English</a>
    <a href="?orderId=${order?.id || ''}&tracking=${tracking || ''}&lang=fr" style="padding:4px 10px; background:${lang === 'fr' ? '#000' : '#fff'}; color:${lang === 'fr' ? '#fff' : '#000'}; border:1px solid #000; border-radius:4px; text-decoration:none; font-weight:bold;">🇫🇷 Français</a>
  </div>

  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">ChariDay Express</div>
        <div class="brand-sub">${dict.brandSub} | ${dict.weightLabel} ${totalWeightStr}</div>
      </div>
      <div style="display:flex; gap:4px; align-items:center;">
        <span className="badge" style="background:#4b5563;">${dict.paymentBadge}</span>
        <span className="badge">${isHomeDelivery ? dict.deliveryHome : dict.deliveryOffice}</span>
      </div>
    </div>

    <!-- Barcode & QR Code Section -->
    <div class="barcode-container">
      <div style="padding:4px 0; background:#fff; margin:0 auto; text-align:center;">
        ${barcodeSvg}
      </div>
      <div class="tracking-code">${trackingNo}</div>
      <div style="font-size:8px; color:#555;">${dict.orderNumLabel} #${orderNum} | ${dict.dateLabel} ${createdDate}</div>
    </div>

    <!-- Sender & Recipient Grid -->
    <div class="section-grid">
      <div class="box">
        <div class="box-title">${dict.senderTitle}</div>
        <div class="val-bold">${storeName}</div>
        <div class="val-sub">📱 ${storePhone}</div>
        <div class="val-sub">📍 ${storeAddress}</div>
      </div>

      <div class="box">
        <div class="box-title">${dict.recipientTitle}</div>
        <div class="val-bold">${buyerName}</div>
        <div class="val-sub">📱 ${buyerPhone} ${buyerPhone2 ? ' / ' + buyerPhone2 : ''}</div>
      </div>
    </div>

    <!-- Address Detail -->
    <div class="address-box">
      <span class="wilaya-badge">${wilaya} (${commune})</span>
      <div style="font-size:10.5px; font-weight:bold; margin-top:2px;">📍 ${fullStreetAddress}</div>
    </div>

    <!-- Items Table -->
    <div>
      <table class="items-table">
        <thead>
          <tr>
            <th>${dict.productCol}</th>
            <th>${dict.qtyCol}</th>
            <th>${dict.totalCol}</th>
          </tr>
        </thead>
        <tbody>
          ${items.length > 0 ? items.map((it: any) => {
            const pName = (lang === 'en' || lang === 'fr') 
              ? (it.product?.nameEn || it.product?.name || it.productName || dict.freeItem)
              : (it.product?.name || it.productName || dict.freeItem);
            const skuStr = it.product?.sku ? ` (SKU: ${it.product.sku})` : '';

            return `
            <tr>
              <td>${pName}${skuStr}</td>
              <td style="text-align:center;">${it.quantity || 1}</td>
              <td style="text-align:${dict.dir === 'rtl' ? 'left' : 'right'};">${((it.price || 0) * (it.quantity || 1)).toLocaleString()} DZD</td>
            </tr>
          `;
          }).join('') : `
            <tr>
              <td>${dict.freeItem}</td>
              <td style="text-align:center;">1</td>
              <td style="text-align:${dict.dir === 'rtl' ? 'left' : 'right'};">${totalAmount.toLocaleString()} DZD</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Flags Row -->
    <div class="flags-row">
      <span>${dict.fragile}</span>
      <span>${dict.inspection}</span>
      <span>${dict.exchange}</span>
    </div>

    <!-- COD Financial Box -->
    <div class="cod-box">
      <div style="font-size:8px; font-weight:900; color:#555;">${dict.codHeader}</div>
      <div class="cod-amount">${dict.codText}</div>
      ${isCod ? `<div class="tafqeet-line">${dict.onlyPrefix} ${tafqeetText}</div>` : ''}
    </div>

    <!-- Footer Stamp & Signature -->
    <div class="footer-stamp">
      <div>
        <div>${dict.footerNotice}</div>
        <div>${dict.issueDate} ${new Date().toISOString().slice(0, 10)}</div>
      </div>
      <div class="sign-box">${dict.signature}</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error generating waybill: ${error.message}`, { status: 500 });
  }
}
