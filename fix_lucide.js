const fs = require('fs');

let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const strToFind = `  ChevronLeft, ChevronRight, Star, TrendingUp, Shield, Truck, \n  ArrowLeft, ArrowRight, ShoppingBag, Award, Quote, SlidersHorizontal, \n  X, Search, Tag, ShoppingCart, Flame, Sparkles, CheckCircle2 \n} from 'lucide-react';`;

// Replace all occurrences of this string EXCEPT the first one.
let parts = code.split(strToFind);
if (parts.length > 2) {
  code = parts[0] + strToFind + parts.slice(1).join('');
}

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
console.log('Fixed stray lucide-react export');
