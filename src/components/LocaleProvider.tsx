"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

type Locale = "de" | "en";

const COOKIE_NAME = "locale";
const COOKIE_MAX_AGE = 31536000; // 1 year

function getLocaleFromCookie(): Locale {
    if (typeof document === "undefined") return "de";
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const value = match?.[1];
    return value === "en" ? "en" : "de";
}

function setLocaleCookie(locale: Locale) {
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleSwitch(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error("useLocaleSwitch must be used within LocaleProvider");
    return ctx;
}

type MessagesByLocale = { de: AbstractIntlMessages; en: AbstractIntlMessages };

export default function LocaleProvider({
    messages,
    initialLocale = "de",
    initialMessages,
    children,
}: {
    messages: MessagesByLocale;
    initialLocale?: Locale;
    initialMessages?: AbstractIntlMessages;
    children: React.ReactNode;
}) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof document === "undefined") return;
        const fromCookie = getLocaleFromCookie();
        if (fromCookie !== locale) setLocaleState(fromCookie);
    }, [mounted, locale]);

    const setLocale = useCallback((next: Locale) => {
        if (next === locale) return;
        setLocaleCookie(next);
        setLocaleState(next);
    }, [locale]);

    const currentMessages =
        initialMessages && !mounted
            ? initialMessages
            : (messages[locale] ?? messages.de);

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            <NextIntlClientProvider locale={locale} messages={currentMessages}>
                {children}
            </NextIntlClientProvider>
        </LocaleContext.Provider>
    );
}
