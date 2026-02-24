"use client";

import React, { useEffect, useState } from "react";

/**
 * Renders children only after mount (client-side). Use for content that
 * depends on browser APIs (navigator, window, document) during static export.
 */
export default function ClientOnly({
    children,
    fallback = null,
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <>{fallback}</>;
    return <>{children}</>;
}
