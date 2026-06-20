const fs = require('fs');

const models = `
// ============================================
// KYC / KYB VERIFICATION MODULE (Ballerine Inspired)
// ============================================

enum VerificationGlobalStatus {
  NOT_SUBMITTED
  PENDING_REVIEW
  APPROVED
  REJECTED
  REQUIRES_RESUBMISSION
}

enum VerificationDocumentType {
  NATIONAL_ID_FRONT
  NATIONAL_ID_BACK
  PASSPORT
  SELFIE
  BUSINESS_LICENSE
  COMMERCIAL_REGISTRATION
  TAX_ID
  ADDRESS_PROOF
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}

model SellerVerification {
  id              String                   @id @default(cuid())
  sellerId        String                   @unique
  seller          SellerProfile            @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  
  status          VerificationGlobalStatus @default(NOT_SUBMITTED)
  riskLevel       String                   @default("LOW")
  
  submittedAt     DateTime?
  lastReviewedAt  DateTime?
  missingDocs     String?                  @db.Text

  documents       VerificationDocument[]
  reviewLogs      VerificationReviewLog[]

  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
}

model VerificationDocument {
  id              String                   @id @default(cuid())
  verificationId  String
  verification    SellerVerification       @relation(fields: [verificationId], references: [id], onDelete: Cascade)
  
  type            VerificationDocumentType
  url             String
  status          DocumentStatus           @default(PENDING)
  rejectionReason String?                  @db.Text
  
  uploadedAt      DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
}

model VerificationReviewLog {
  id              String                   @id @default(cuid())
  verificationId  String
  verification    SellerVerification       @relation(fields: [verificationId], references: [id], onDelete: Cascade)
  
  reviewerId      String
  reviewerName    String
  action          String
  
  oldStatus       VerificationGlobalStatus
  newStatus       VerificationGlobalStatus
  
  notes           String?                  @db.Text
  
  createdAt       DateTime                 @default(now())
}
`;

fs.appendFileSync('prisma/schema.prisma', models);
console.log('Appended KYC models to schema.prisma successfully.');
