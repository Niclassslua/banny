"use client";

import React from "react";
import { useLocaleSwitch } from "@/components/LocaleProvider";

const SUPPORTED_LOCALES = ["de", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LanguageSwitch: React.FC = () => {
    const { locale, setLocale } = useLocaleSwitch();

    const handleSwitch = (target: SupportedLocale) => {
        setLocale(target);
    };

    return (
        <div className="flex items-center gap-1 text-xs text-white/60">
            {SUPPORTED_LOCALES.map((code) => {
                const isActive = code === locale;
                return (
                    <button
                        key={code}
                        type="button"
                        onClick={() => handleSwitch(code)}
                        className={`rounded-full px-2 py-1 transition ${
                            isActive
                                ? "bg-white text-black"
                                : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                        aria-pressed={isActive}
                    >
                        {code.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
};

export default LanguageSwitch;

