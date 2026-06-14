const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const import1 = "import { \n  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, \n  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, \n  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 \n} from 'lucide-react';";
const import2 = "import { \n  HeroSliderSkeleton, CategoryCirclesSkeleton, BentoPromoGridSkeleton, \n  ProductSliderSkeleton \n} from './SkeletonLoaders';";

while (code.indexOf(import1) !== code.lastIndexOf(import1)) {
  code = code.replace(import1, '');
}

while (code.indexOf(import2) !== code.lastIndexOf(import2)) {
  code = code.replace(import2, '');
}

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
console.log('Fixed imports');
