import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const inviteId = req.nextUrl.searchParams.get('id');

    if (!inviteId) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; direction: rtl;">
            <h1 style="color: #ff3b30;">❌ خطأ في الرابط</h1>
            <p>رابط الدعوة غير صالح أو مفقود.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
      );
    }

    const staffMapping = await db.storeStaff.findUnique({
      where: { id: inviteId },
      include: { store: true, user: true }
    });

    if (!staffMapping) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; direction: rtl;">
            <h1 style="color: #ff3b30;">❌ دعوة غير موجودة</h1>
            <p>عذراً، لم نتمكن من العثور على هذه الدعوة. قد تكون قد حُذفت أو انتهت صلاحيتها.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 }
      );
    }

    // Update status to active
    await db.storeStaff.update({
      where: { id: inviteId },
      data: { status: 'active' }
    });

    // Also update global role if it is 'buyer' to the staff role to ensure dashboard access
    if (staffMapping.user.role === 'buyer') {
      await db.user.update({
        where: { id: staffMapping.userId },
        data: { role: staffMapping.role || 'staff' }
      });
    }

    const loginUrl = `${req.nextUrl.origin}/login`;

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تم قبول الدعوة بنجاح 🎉</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            text-align: center;
            max-width: 500px;
            width: 90%;
            border: 1px solid #eef2f1;
          }
          .icon {
            font-size: 60px;
            margin-bottom: 20px;
          }
          h1 {
            color: #34c759;
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: 800;
          }
          p {
            color: #555;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 15px;
          }
          .btn {
            background-color: #007aff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            display: inline-block;
            transition: background-color 0.2s;
            box-shadow: 0 4px 6px rgba(0,122,255,0.15);
          }
          .btn:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎉</div>
          <h1>تم قبول الدعوة بنجاح!</h1>
          <p>لقد انضممت بنجاح إلى فريق عمل متجر <strong>"${staffMapping.store.name}"</strong> بصفة موظف نشط.<br>يمكنك الآن تسجيل الدخول للبدء بالعمل وإدارة المتجر.</p>
          <a href="${loginUrl}" class="btn">الذهاب لتسجيل الدخول</a>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error('[accept-invite GET]', error);
    return new NextResponse(
      `<html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; direction: rtl;">
          <h1 style="color: #ff3b30;">❌ فشل قبول الدعوة</h1>
          <p>حدث خطأ غير متوقع في النظام. يرجى المحاولة لاحقاً.</p>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
    );
  }
}
