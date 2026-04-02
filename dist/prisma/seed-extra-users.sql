-- Add ربيعة and سيف users to Hostinger database
-- Run this in phpMyAdmin SQL tab

-- ربيعة المشترية
INSERT IGNORE INTO `User` (`id`, `email`, `name`, `nameEn`, `role`, `accountStatus`, `isActive`, `isVerified`, `phoneVerified`, `emailVerified`, `locale`, `createdAt`, `updatedAt`)
VALUES (LOWER(HEX(RANDOM_BYTES(12))), 'rabiaa@charyday.com', 'ربيعة المشترية', 'Rabiaa Buyer', 'buyer', 'active', 1, 1, 1, 1, 'ar', NOW(), NOW());

-- سيف المشتري
INSERT IGNORE INTO `User` (`id`, `email`, `name`, `nameEn`, `role`, `accountStatus`, `isActive`, `isVerified`, `phoneVerified`, `emailVerified`, `locale`, `createdAt`, `updatedAt`)
VALUES (LOWER(HEX(RANDOM_BYTES(12))), 'sayf@charyday.com', 'سيف المشتري', 'Sayf Buyer', 'buyer', 'active', 1, 1, 1, 1, 'ar', NOW(), NOW());

-- Create wallets for ربيعة and سيف
INSERT IGNORE INTO `Wallet` (`id`, `userId`, `balance`, `totalEarned`, `totalSpent`, `currency`, `createdAt`, `updatedAt`)
SELECT LOWER(HEX(RANDOM_BYTES(12))), u.`id`, 5000, 0, 0, 'DZD', NOW(), NOW()
FROM `User` u WHERE u.`email` IN ('rabiaa@charyday.com', 'sayf@charyday.com')
AND NOT EXISTS (SELECT 1 FROM `Wallet` w WHERE w.`userId` = u.`id`);

-- Create BuyerProfiles for ربيعة and سيف
INSERT IGNORE INTO `BuyerProfile` (`id`, `userId`, `totalOrders`, `totalSpent`, `loyaltyPoints`, `createdAt`, `updatedAt`)
SELECT LOWER(HEX(RANDOM_BYTES(12))), u.`id`, 0, 0, 100, NOW(), NOW()
FROM `User` u WHERE u.`email` IN ('rabiaa@charyday.com', 'sayf@charyday.com')
AND NOT EXISTS (SELECT 1 FROM `BuyerProfile` bp WHERE bp.`userId` = u.`id`);

-- Verify
SELECT `email`, `name`, `role`, `accountStatus` FROM `User` WHERE `email` IN ('rabiaa@charyday.com', 'sayf@charyday.com');
