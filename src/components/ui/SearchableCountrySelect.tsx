'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WORLD_COUNTRIES, CountryInfo, getCountryByCode } from '@/lib/data/countries';
import { Search, ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchableCountrySelectProps {
  value: string;
  onChange: (country: CountryInfo) => void;
  isAr?: boolean;
}

export function SearchableCountrySelect({ value, onChange, isAr = true }: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = getCountryByCode(value);

  const filteredCountries = WORLD_COUNTRIES.filter(c => 
    c.nameAr.includes(search) || 
    c.nameEn.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-background border border-input hover:border-primary/50 rounded-xl transition-all text-start text-foreground shadow-sm"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-xl shrink-0">{selectedCountry.flag}</span>
          <span className="text-sm font-bold truncate">
            {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu with Search - Perfect Light & Dark Mode Support */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-slate-950/80 sticky top-0 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? '🔍 ابحث باسم الدولة...' : '🔍 Search country name...'}
                className="ps-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl h-9 text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {isAr ? 'لم يتم العثور على دولة بهذا الاسم' : 'No matching country found'}
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-start text-xs ${
                      isSelected 
                        ? 'bg-primary/10 text-primary font-bold border border-primary/30' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden me-2">
                      <span className="text-lg shrink-0">{c.flag}</span>
                      <span className="font-bold truncate">{isAr ? c.nameAr : c.nameEn}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {c.currency}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
