const fs = require('fs');
const homepageCode = fs.readFileSync('src/components/storefront/HomepagePage.tsx', 'utf8');

let helpers = homepageCode.substring(0, homepageCode.indexOf('export default function StorefrontHomepage'));

helpers = helpers.replace(/import.*?from.*?;/g, '');
helpers = helpers.replace(/'use client';/, '');

const imports = `\'use client\';
import React, { useState, useEffect, useCallback, useRef, useMemo } from \'react\';
import { useRouter } from \'next/navigation\';
import Link from \'next/link\';
import { 
  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, 
  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, 
  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 
} from \'lucide-react\';
import { useAppStore, useAuthStore, useCartStore } from \'@/lib/store\';
import { Button } from \'@/components/ui/button\';
import { Badge } from \'@/components/ui/badge\';
import { Card, CardContent } from \'@/components/ui/card\';
import { Input } from \'@/components/ui/input\';
import { useTranslation } from \'@/lib/i18n/useTranslation\';
import { 
  HeroSliderSkeleton, CategoryCirclesSkeleton, BentoPromoGridSkeleton, 
  ProductSliderSkeleton 
} from \'./SkeletonLoaders\';

export interface SectionProps {
  section: any;
  data: any;
  locale: string;
}
`;

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', imports + '\n' + helpers);
console.log('SaadaBlocks initialized.');
