'use client';
import React from 'react';
import SellerRoleGuard from '@/components/seller/SellerRoleGuard';

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <SellerRoleGuard>{children}</SellerRoleGuard>;
}
