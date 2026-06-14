const fs = require('fs');

let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const badChunk1 = `

  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, 
  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, 
  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 
} from 'lucide-react';`;

const badChunk2 = `

  HeroSliderSkeleton, CategoryCirclesSkeleton, BentoPromoGridSkeleton, 
  ProductSliderSkeleton 
} from './SkeletonLoaders';`;

// Let's just remove anything that matches these exactly
code = code.split(badChunk1).join('');
code = code.split(badChunk2).join('');

// And just to be absolutely certain, let's remove any other stray imports.
// Look for lines that end with `} from 'lucide-react';` without starting with import.
code = code.replace(/[\s\S]*?\} from 'lucide-react';/, function(match) {
   // Wait, that might remove too much.
   return match;
});

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
console.log('Fixed SaadaBlocks.tsx');
