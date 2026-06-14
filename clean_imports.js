const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

// Find the first occurrence of "export interface SectionProps"
const interfaceIndex = code.indexOf('export interface SectionProps');
if (interfaceIndex !== -1) {
  // Extract everything from the interface onwards
  const body = code.substring(interfaceIndex);
  
  const cleanImports = `'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, 
  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, 
  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  HeroSliderSkeleton, CategoryCirclesSkeleton, BentoPromoGridSkeleton, 
  ProductSliderSkeleton 
} from './SkeletonLoaders';
import "@measured/puck/puck.css";

`;

  fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', cleanImports + body);
  console.log('Fixed imports perfectly');
}
