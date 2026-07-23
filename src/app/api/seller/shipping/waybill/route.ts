import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { tafqeetCurrency } from '@/lib/utils/tafqeet';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const tracking = searchParams.get('tracking');

    let order: any = null;

    if (orderId) {
      order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          store: true,
          buyer: true,
        },
      });
    } else if (tracking) {
      // Find order by tracking or orderNumber
      const orderNumMatch = tracking.replace(/^DZ-[A-Z]+-/, '');
      order = await db.order.findFirst({
        where: {
          OR: [
            { orderNumber: { contains: orderNumMatch } },
            { id: tracking },
          ],
        },
        include: {
          items: { include: { product: true } },
          store: true,
          buyer: true,
        },
      });
    }

    if (!order) {
      // Return friendly HTML error page
      return new NextResponse(`
        <html dir="rtl"><body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>⚠️ لم يتم العثور على بيانات الطلب أو بوليصة الشحن</h2>
          <p>يرجى التأكد من اختيار طلب صحيح من لوحة التاجر.</p>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 });
    }

    // Extract Order Data
    const orderNum = order.orderNumber || `CHARI-${(order.id || '').substring(0, 8)}`;
    const trackingNo = tracking || `DZ-CDX-${orderNum.replace(/[^A-Z0-9]/gi, '').slice(-10)}`;
    const storeName = order.store?.name || 'متجر رانيا (ChariDay Merchant)';
    const storePhone = order.store?.phone || order.store?.contactPhone || '0555-00-00-00';
    const storeAddress = order.store?.address || 'الجزائر العاصمة';

    // Buyer info
    let buyerName = order.buyer?.name || 'زبون المنصة';
    let buyerPhone = order.buyer?.phone || 'غير مدخل';
    let buyerPhone2 = '';
    let shippingAddr = order.shippingAddress || order.address || {};

    if (typeof shippingAddr === 'string') {
      try {
        shippingAddr = JSON.parse(shippingAddr);
      } catch (e) {
        shippingAddr = { address: shippingAddr };
      }
    }

    if (shippingAddr.fullName) buyerName = shippingAddr.fullName;
    if (shippingAddr.phone) buyerPhone = shippingAddr.phone;
    if (shippingAddr.secondaryPhone) buyerPhone2 = shippingAddr.secondaryPhone;

    const wilaya = shippingAddr.wilaya || shippingAddr.state || 'الجزائر';
    const commune = shippingAddr.commune || shippingAddr.city || 'سيدي امحمد';
    const fullStreetAddress = shippingAddr.address || shippingAddr.street || 'العنوان التفصيلي مسجل بالطلب';

    // Items calculation
    const items = Array.isArray(order.items) ? order.items : [];
    const totalAmount = order.total || order.totalAmount || 0;
    const tafqeetText = tafqeetCurrency(totalAmount, 'DZD');

    const createdDate = new Date(order.createdAt || Date.now()).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isHomeDelivery = true;

    // Standard Industry A6 Thermal Bill of Lading HTML/CSS
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بوليصة شحن حرارية - ${trackingNo}</title>
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
    .barcode-svg {
      max-height: 38px;
      width: 85%;
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
      font-size: 12px;
      font-weight: 900;
      padding: 1px 6px;
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
      text-align: right;
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
      width: 75px;
      height: 25px;
      text-align: center;
      line-height: 25px;
      font-size: 7px;
      color: #888;
    }
    @media print {
      body { padding: 0; }
      .wrapper { border: 2px solid #000; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">ChariDay Express</div>
        <div class="brand-sub">محرك الشحن والتوصيل الموحد</div>
      </div>
      <div class="badge">${isHomeDelivery ? 'توصيل للمنزل 🏠' : 'تسليم بالمكتب 🏢'}</div>
    </div>

    <!-- Barcode & QR Code Section -->
    <div class="barcode-container">
      <!-- Simulated High-Precision Code128 Barcode via CSS Lines -->
      <div style="display:flex; justify-center:center; align-items:center; gap:1.5px; height:32px; background:#fff; padding:2px; margin:0 auto; width:80%;">
        ${Array.from({ length: 45 }).map((_, i) => `
          <div style="height:100%; width:${(i % 3 === 0 ? 3 : (i % 2 === 0 ? 1 : 2))}px; background:#000;"></div>
        `).join('')}
      </div>
      <div class="tracking-code">${trackingNo}</div>
      <div style="font-size:8px; color:#555;">رقم الطلب: #${orderNum} | التاريخ: ${createdDate}</div>
    </div>

    <!-- Sender & Recipient Grid -->
    <div class="section-grid">
      <div class="box">
        <div class="box-title">المرسل (FROM):</div>
        <div class="val-bold">${storeName}</div>
        <div class="val-sub">📱 ${storePhone}</div>
        <div class="val-sub">📍 ${storeAddress}</div>
      </div>

      <div class="box">
        <div class="box-title">المستلم (TO):</div>
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
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${items.length > 0 ? items.map((it: any) => `
            <tr>
              <td>${it.product?.name || it.name || 'عنصر مجاني'}</td>
              <td style="text-align:center;">${it.quantity || 1}</td>
              <td style="text-align:left;">${((it.price || 0) * (it.quantity || 1)).toLocaleString()} د.ج</td>
            </tr>
          `).join('') : `
            <tr>
              <td>طرد منتجات متجر رانيا</td>
              <td style="text-align:center;">1</td>
              <td style="text-align:left;">${totalAmount.toLocaleString()} د.ج</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Flags Row -->
    <div class="flags-row">
      <span>🍷 قابل للكسر (Fragile)</span>
      <span>⚡ مسموح الفحص قبل الدفع</span>
      <span>🔄 قابل للتبديل</span>
    </div>

    <!-- COD Financial Box -->
    <div class="cod-box">
      <div style="font-size:8px; font-weight:900; color:#555;">المبلغ الصافي المطلوب تحصيله (COD AMOUNT):</div>
      <div class="cod-amount">${totalAmount.toLocaleString()} د.ج</div>
      <div class="tafqeet-line">فقط: ${tafqeetText}</div>
    </div>

    <!-- Footer Stamp & Signature -->
    <div class="footer-stamp">
      <div>
        <div>طبع عبر منصة ChariDay الرقمية | بوليصة رسمية معتمدة</div>
        <div>تاريخ الإصدار: ${new Date().toISOString().slice(0, 10)}</div>
      </div>
      <div class="sign-box">توقيع وختم المستلم</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto print when page opens
      setTimeout(function() {
        window.print();
      }, 400);
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
