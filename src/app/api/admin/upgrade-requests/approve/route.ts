import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import crypto from 'crypto';

// POST /api/admin/upgrade-requests/approve
// Approves document review (Pending -> Awaiting Payment) OR confirms payment (Payment Submitted -> Approved)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || !session.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, packageId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true, storeVerification: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const upgradeRequest = await db.upgradeRequest.findFirst({
      where: { userId: userId, isActive: true }
    });

    if (!upgradeRequest) {
      return NextResponse.json({ success: false, error: 'No active upgrade request found' }, { status: 404 });
    }

    // PHASE 1: Document Approval (PENDING -> AWAITING_PAYMENT)
    if (upgradeRequest.status === 'PENDING') {
      const fee = Number(upgradeRequest.feeSnapshot || 500);

      const invoiceId = 'INV-UPG-' + crypto.randomBytes(4).toString('hex').toUpperCase();

      await db.$transaction(async (tx) => {
        // Update request status
        await tx.upgradeRequest.update({
          where: { id: upgradeRequest.id },
          data: {
            status: 'AWAITING_PAYMENT',
            invoiceId,
            reviewedBy: session.user.id,
            reviewedAt: new Date()
          }
        });

        // Create Invoice
        await tx.invoice.create({
          data: {
            id: invoiceId,
            userId: user.id,
            type: 'UPGRADE',
            status: 'PENDING',
            amount: fee,
            amountPaid: 0,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            items: JSON.stringify([{
              descriptionAr: 'ترقية الحساب إلى متجر أعمال',
              descriptionEn: 'Business Store Upgrade Fee',
              quantity: 1,
              price: fee,
              total: fee
            }]),
          }
        });

        // Notify user about doc approval and invoice creation
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'UPGRADE_DOCS_APPROVED',
            title: 'الموافقة المبدئية على طلب الترقية',
            titleEn: 'Upgrade Documents Pre-Approved',
            body: `تمت الموافقة على مستندات متجرك. يرجى دفع رسوم الترقية بقيمة ${fee} دج ورفع وصل السداد لتفعيل الحساب.`,
            bodyEn: `Your business documents are pre-approved. Please pay the upgrade fee of ${fee} DZD and upload the receipt to activate.`,
          }
        });
      });

      return NextResponse.json({ success: true, message: 'Documents pre-approved and invoice created.' });
    }

    // PHASE 2: Payment Approval & Final Activation (PAYMENT_SUBMITTED -> APPROVED)
    if (upgradeRequest.status === 'PAYMENT_SUBMITTED') {
      let storeName = user.sellerProfile?.storeName || user.name || 'Store';
      let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!slug) slug = 'store-' + crypto.randomBytes(4).toString('hex');
      
      // Ensure slug uniqueness
      let isUnique = false;
      let counter = 1;
      let finalSlug = slug;
      while (!isUnique) {
        const existing = await db.store.findUnique({ where: { slug: finalSlug } });
        if (!existing) {
          isUnique = true;
        } else {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      await db.$transaction(async (tx) => {
        // 1. Upgrade request status
        await tx.upgradeRequest.update({
          where: { id: upgradeRequest.id },
          data: {
            status: 'APPROVED',
            paymentConfirmedAt: new Date(),
            reviewedBy: session.user.id,
            reviewedAt: new Date()
          }
        });

        // 2. Mark invoice as PAID
        if (upgradeRequest.invoiceId) {
          await tx.invoice.update({
            where: { id: upgradeRequest.invoiceId },
            data: {
              status: 'PAID',
              amountPaid: Number(upgradeRequest.feeSnapshot || 500),
              paidAt: new Date()
            }
          });
        }

        // 3. Archive freelancer verification (StoreVerification)
        if (user.storeVerification) {
          await tx.storeVerification.update({
            where: { id: user.storeVerification.id },
            data: {
              isArchived: true,
              archivedAt: new Date()
            }
          });
        }

        // 4. Create BusinessVerification record
        await tx.businessVerification.create({
          data: {
            userId: user.id,
            upgradeRequestId: upgradeRequest.id,
            companyName: storeName,
            businessRegisterNumber: upgradeRequest.businessRegisterNumber,
            businessRegisterFile: upgradeRequest.businessRegisterFile,
            businessNisNumber: upgradeRequest.businessNisNumber,
            managerName: user.name,
            managerIdFront: upgradeRequest.businessManagerIdFront,
            managerIdBack: upgradeRequest.businessManagerIdBack,
            iban: upgradeRequest.businessIban,
            bankName: upgradeRequest.businessBankName,
            bankLetterFile: upgradeRequest.businessBankLetterFile,
            verificationStatus: 'approved'
          }
        });

        // 5. Update user role and verification status
        await tx.user.update({
          where: { id: user.id },
          data: { 
            role: 'store_manager',
            accountStatus: 'active',
            isVerified: true
          }
        });

        // 6. Sync SellerProfile
        if (user.sellerProfile) {
          await tx.sellerProfile.update({
            where: { id: user.sellerProfile.id },
            data: { 
              wantsUpgrade: false, 
              upgradeRequestedAt: null,
              isVerified: true
            }
          });
        }

        // 7. Create Store
        const store = await tx.store.create({
          data: {
            name: storeName,
            nameEn: user.sellerProfile?.storeNameEn || user.name || 'Store',
            slug: finalSlug,
            managerId: user.id,
            packageId: packageId || null,
            logo: user.sellerProfile?.logo || null,
            coverImage: user.sellerProfile?.coverImage || null,
            addonBusinessUpgrade: true
          }
        });

        // 8. Create staff ownership record
        await tx.storeStaff.create({
          data: {
            role: 'owner',
            storeId: store.id,
            userId: user.id
          }
        });

        // 9. Send success notification to seller
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'UPGRADE_SUCCESS',
            title: 'تمت ترقية متجرك بنجاح! 🎉',
            titleEn: 'Your store has been upgraded successfully! 🎉',
            body: `تم تفعيل حسابك كمتجر أعمال. يمكنك الآن إضافة فروع المتجر وتعيين فريق العمل والاستمتاع بالمميزات الإضافية.`,
            bodyEn: `Your account is now activated as a Business Store. You can add branches, manage staff, and access premium dashboard features.`,
          }
        });
      });

      return NextResponse.json({ success: true, message: 'Account upgraded to business store successfully.' });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Upgrade request is in an invalid status for approval.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('[POST /api/admin/upgrade-requests/approve] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

