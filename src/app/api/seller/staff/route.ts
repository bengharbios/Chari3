import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// GET /api/seller/staff?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    const store = await db.store.findFirst({
      where: { managerId: userId },
      include: { package: true },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const staffList = await db.storeStaff.findMany({
      where: { storeId: store.id },
      include: {
        user: { select: { id: true, name: true, nameEn: true, email: true, phone: true, isActive: true, role: true, avatar: true } }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const maxTeamMembers = store.package?.maxTeamMembers || 1;

    return NextResponse.json({
      success: true,
      staff: staffList,
      maxTeamMembers,
      currentTeamSize: staffList.length,
    });
  } catch (error) {
    console.error('[GET /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/staff
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, role, password } = body;

    if (!userId || !email || !name) {
      return NextResponse.json({ success: false, error: 'userId, name, and email are required' }, { status: 400 });
    }

    const store = await db.store.findFirst({
      where: { managerId: userId },
      include: { package: true },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Phase 3: Enforce maxTeamMembers
    const currentStaffCount = await db.storeStaff.count({ where: { storeId: store.id } });
    const maxTeamMembers = store.package?.maxTeamMembers || 1;

    if (currentStaffCount >= maxTeamMembers) {
      return NextResponse.json({ 
        success: false, 
        error: `تجاوزت الحد الأقصى للموظفين (${maxTeamMembers}). يرجى ترقية باقتك لإضافة المزيد.`
      }, { status: 403 });
    }

    // Check if user exists
    let staffUser = await db.user.findUnique({ where: { email } });

    // Validate phone number uniqueness before database insert/operation
    if (phone) {
      const existingPhoneUser = await db.user.findUnique({ where: { phone } });
      if (existingPhoneUser && existingPhoneUser.email !== email) {
        return NextResponse.json({
          success: false,
          error: 'رقم الهاتف هذا مسجل بالفعل لحساب مستخدم آخر بالمنصة.'
        }, { status: 400 });
      }
    }

    if (staffUser) {
      // Check if user is already a merchant/partner account
      const isMerchantOrAdmin = 
        staffUser.role === 'store' || 
        staffUser.role === 'freelancer' || 
        staffUser.role === 'supplier' || 
        staffUser.role === 'logistics' || 
        staffUser.role === 'admin' || 
        staffUser.role === 'super_admin';

      // Also double check if they have a store or seller profile
      const ownsStore = await db.store.findFirst({ where: { managerId: staffUser.id } });
      const hasSellerProfile = await db.sellerProfile.findUnique({ where: { userId: staffUser.id } });

      if (isMerchantOrAdmin || ownsStore || hasSellerProfile) {
        return NextResponse.json({
          success: false,
          error: 'هذا البريد الإلكتروني مسجل كحساب تاجر أو شريك نشط بالمنصة. لتجنب تداخل الصلاحيات والأدوار، لا يمكن إضافة حسابات التجار كموظفين لدى متاجر أخرى.'
        }, { status: 400 });
      }
    }

    if (!staffUser) {
      // Create new user with provided password or default 'password123'
      const pwd = password || 'password123';
      const hashedPassword = await bcrypt.hash(pwd, 10);
      staffUser = await db.user.create({
        data: {
          email,
          name,
          phone: phone || null,
          password: hashedPassword,
          role: role || 'staff',
        }
      });
    } else {
      // Only promote from 'buyer' to the staff role to enable dashboard access.
      // Do NOT demote or modify other roles globally.
      if (staffUser.role === 'buyer') {
        await db.user.update({
          where: { id: staffUser.id },
          data: { role: role || 'staff' }
        });
      }
    }

    // Check if already in this store
    const existingStaff = await db.storeStaff.findUnique({
      where: {
        storeId_userId: {
          storeId: store.id,
          userId: staffUser.id
        }
      }
    });

    if (existingStaff) {
      return NextResponse.json({ success: false, error: 'الموظف موجود بالفعل في هذا المتجر' }, { status: 400 });
    }

    // Create staff mapping as PENDING invitation
    const newStaff = await db.storeStaff.create({
      data: {
        storeId: store.id,
        userId: staffUser.id,
        role: role || 'staff',
        status: 'pending' // invitation pending
      },
      include: {
        user: { select: { id: true, name: true, nameEn: true, email: true, phone: true, isActive: true, role: true, avatar: true } }
      }
    });

    // Fetch SMTP / Email Settings and send invitation email
    try {
      const emailSettings = await db.systemSetting.findMany({
        where: {
          key: { in: ['otp_email_enabled', 'otp_smtp_host', 'otp_smtp_port', 'otp_smtp_user', 'otp_smtp_pass', 'otp_smtp_from'] }
        }
      });
      const settingsMap = emailSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

      if (settingsMap.otp_email_enabled === 'true' && settingsMap.otp_smtp_host) {
        const transporter = nodemailer.createTransport({
          host: settingsMap.otp_smtp_host,
          port: Number(settingsMap.otp_smtp_port) || 587,
          secure: Number(settingsMap.otp_smtp_port) === 465,
          auth: {
            user: settingsMap.otp_smtp_user,
            pass: settingsMap.otp_smtp_pass,
          },
        });

        const inviteLink = `${req.nextUrl.origin}/api/seller/staff/accept-invite?id=${newStaff.id}`;

        const roleTextAr = role === 'store_manager' ? 'مدير متجر' : role === 'editor' ? 'محرر محتوى' : role === 'support' ? 'دعم عملاء' : 'موظف';
        const roleTextEn = role || 'Staff';

        await transporter.sendMail({
          from: settingsMap.otp_smtp_from || '"ChariDay" <no-reply@chariday.com>',
          to: email,
          subject: 'دعوة للانضمام إلى فريق عمل متجر (ChariDay)',
          text: `لقد تم دعوتك للانضمام إلى فريق عمل متجر "${store.name}" بدور "${roleTextEn}". للموافقة والقبول، اضغط على الرابط التالي: ${inviteLink}`,
          html: `<div style="text-align: right; font-family: sans-serif; direction: rtl; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #007aff; text-align: center;">مرحباً بك في ChariDay</h2>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p>لقد قام التاجر المالك لمتجر <strong>${store.name}</strong> بدعوتك للانضمام إلى فريق عمله بصفة: <strong>${roleTextAr}</strong>.</p>
                  <p>للموافقة وتأكيد انضمامك إلى المتجر لبدء العمل، يرجى الضغط على زر التأكيد أدناه:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #007aff; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,122,255,0.15);">قبول الدعوة وتأكيد الانضمام</a>
                  </div>
                  <p style="color: #888; font-size: 11px; text-align: center; margin-top: 20px;">إذا لم تكن قد طلبت هذا الإجراء أو تم إدخال بريدك بالخطأ، يمكنك تجاهل هذه الرسالة دون أي إجراء.</p>
                 </div>`,
        });
        console.log(`[Staff Invite] Invitation email sent to: ${email}`);
      }
    } catch (emailError) {
      console.error('[Staff Invite] Error sending invitation email:', emailError);
    }

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('[POST /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/seller/staff
// For updating roles or suspending staff
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, staffUserId, newRole, suspendAction } = body;

    if (!userId || !staffUserId) {
      return NextResponse.json({ success: false, error: 'userId and staffUserId required' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const staffMapping = await db.storeStaff.findUnique({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      }
    });

    if (!staffMapping) {
      return NextResponse.json({ success: false, error: 'Staff member not found in this store' }, { status: 404 });
    }

    if (newRole) {
      // Update both User role and StoreStaff role for consistency
      await db.user.update({
        where: { id: staffUserId },
        data: { role: newRole }
      });
      await db.storeStaff.update({
        where: { id: staffMapping.id },
        data: { role: newRole }
      });
    }

    if (suspendAction !== undefined) {
      await db.user.update({
        where: { id: staffUserId },
        data: { isActive: !suspendAction } // if suspendAction is true, isActive becomes false
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/seller/staff
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const staffUserId = req.nextUrl.searchParams.get('staffUserId');

    if (!userId || !staffUserId) {
      return NextResponse.json({ success: false, error: 'userId and staffUserId required' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    await db.storeStaff.delete({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
