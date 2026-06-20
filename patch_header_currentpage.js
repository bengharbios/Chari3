const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, 'src', 'components', 'layout', 'Header.tsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// The line is:
// const { locale, setLocale, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout } = useAppStore();

if (headerContent.includes('const { locale, setLocale, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout } = useAppStore();')) {
  headerContent = headerContent.replace(
    'const { locale, setLocale, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout } = useAppStore();',
    'const { locale, setLocale, toggleMobileMenu, setSidebarOpen, isSidebarOpen, allowGuestCheckout, setAllowGuestCheckout, currentPage } = useAppStore();'
  );
  fs.writeFileSync(headerPath, headerContent, 'utf8');
  console.log('Successfully patched Header.tsx');
} else {
  console.log('Could not find the exact line in Header.tsx');
}
