import ThemeBuilder from './ThemeBuilder';

export const metadata = {
  title: 'Theme & Design Management',
};

export default function ThemePage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <ThemeBuilder />
    </div>
  );
}
