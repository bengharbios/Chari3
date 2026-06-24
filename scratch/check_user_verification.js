const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function check() {
  console.log("Checking user 'abdelkader.rapidline@gmail.com' in database...");

  const user = await db.user.findUnique({
    where: { email: 'abdelkader.rapidline@gmail.com' },
    include: {
      storeVerification: true,
      freelancerVerification: true,
      supplierVerification: true,
      logisticsVerification: true,
    }
  });

  if (!user) {
    console.error("❌ User not found!");
    await db.$disconnect();
    return;
  }

  console.log("✔ User found:", {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accountStatus: user.accountStatus,
    isVerified: user.isVerified,
  });

  console.log("Onboarding / Verification records:");
  console.log("- StoreVerification:", user.storeVerification ? {
    id: user.storeVerification.id,
    verificationStatus: user.storeVerification.verificationStatus,
    companyName: user.storeVerification.companyName,
    submittedAt: user.storeVerification.submittedAt,
  } : "None");

  console.log("- FreelancerVerification:", user.freelancerVerification ? {
    id: user.freelancerVerification.id,
    verificationStatus: user.freelancerVerification.verificationStatus,
    submittedAt: user.freelancerVerification.submittedAt,
  } : "None");

  console.log("- SupplierVerification:", user.supplierVerification ? "Exists" : "None");
  console.log("- LogisticsVerification:", user.logisticsVerification ? "Exists" : "None");

  // Also check if any SellerVerification exists for this user/seller
  const sellerProfile = await db.sellerProfile.findUnique({
    where: { userId: user.id },
    include: {
      verification: {
        include: { documents: true }
      }
    }
  });

  console.log("- SellerProfile:", sellerProfile ? {
    id: sellerProfile.id,
    storeName: sellerProfile.storeName,
    isVerified: sellerProfile.isVerified,
    verification: sellerProfile.verification ? {
      id: sellerProfile.verification.id,
      status: sellerProfile.verification.status,
      docsCount: sellerProfile.verification.documents.length,
    } : "None"
  } : "None");

  await db.$disconnect();
}

check();
