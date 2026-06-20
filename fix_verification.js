const fs = require('fs');
let content = fs.readFileSync('src/components/onboarding/VerificationStatusPage.tsx', 'utf8');

const header = `'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Lock, FileText, Phone, Mail, ArrowLeft, ArrowRight, Edit2, ExternalLink, Building2, UserCircle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useOnboardingStore, getVerificationItemsForRole, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import type { VerificationStatus } from '@/lib/store/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { KycVerificationSection } from './KycVerificationSection';

function t(isAr: boolean, ar: string, en: string) {
  return isAr ? ar : en;
}

const statusConfig: Record<
  VerificationStatus,
  { icon: React.ElementType; color: string; bg: string; labelAr: string; labelEn: string }
> = {
  verified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', labelAr: 'موثق', labelEn: 'Verified' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', labelAr: 'قيد المراجعة', labelEn: 'Pending Review' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', labelAr: 'مرفوض', labelEn: 'Rejected' },
  required: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', labelAr: 'مطلوب', labelEn: 'Required' },
};

export default function VerificationStatusPage() {
  const { locale } = useAppStore();
  const { user, updateProfile } = useAuthStore();
  const { accountStatus, verificationItems, rejectionReason, rejectedItems, setAccountStatus } = useOnboardingStore();
`;

// Remove first 15 lines that got mangled (the lines up to "const isAr = locale === 'ar';")
const lines = content.split('\n');
const isArIndex = lines.findIndex(line => line.includes('const isAr = locale === '));

content = lines.slice(isArIndex).join('\n');

fs.writeFileSync('src/components/onboarding/VerificationStatusPage.tsx', header + content);
console.log('Fixed file');
