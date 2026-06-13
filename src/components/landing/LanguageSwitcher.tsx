"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const [lang, setLang] = useState<string>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookieLang = document.cookie.replace(/(?:(?:^|.*;\s*)kbr_lang\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieLang === "en" || cookieLang === "ht") {
      setLang(cookieLang);
    }
  }, []);

  const changeLanguage = (newLang: string) => {
    document.cookie = `kbr_lang=${newLang}; path=/; max-age=31536000`;
    setLang(newLang);
    router.refresh();
  };

  if (!mounted) return <div className="w-32 h-8" />;

  return (
    <div className="flex items-center gap-2 bg-[#07111F] border border-[#1E2A38] rounded-xl px-3 py-1.5 transition-colors hover:border-[#334155]">
      <Globe className="w-4 h-4 text-[#AAB3C2]" />
      <select 
        value={lang} 
        onChange={(e) => changeLanguage(e.target.value)} 
        className="bg-transparent text-xs text-[#AAB3C2] font-medium focus:outline-none cursor-pointer appearance-none outline-none"
        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
      >
        <option value="fr" className="bg-[#020B14] text-white">Français</option>
        <option value="en" className="bg-[#020B14] text-white">English</option>
        <option value="ht" className="bg-[#020B14] text-white">Kreyòl Ayisyen</option>
      </select>
    </div>
  );
}
