"use client";

import { useEffect, useMemo, useState } from "react";
import type { Pattern, PatternCategoryId } from "@/types";
import { filterPatternsByCategory, getPatternCountForCategory } from "@/utils/patterns";

export type PatternFilterCategory = "all" | PatternCategoryId;

type UsePatternFiltersResult = {
    selectedCategory: PatternFilterCategory;
    setSelectedCategory: (category: PatternFilterCategory) => void;
    filteredPatterns: Pattern[];
    getCountForCategory: (category: PatternFilterCategory) => number;
};

export function usePatternFilters(
    selectedPattern: Pattern,
    setSelectedPattern: (pattern: Pattern) => void,
): UsePatternFiltersResult {
    const [selectedCategory, setSelectedCategory] =
        useState<PatternFilterCategory>("all");

    const filteredPatterns = useMemo(
        () => filterPatternsByCategory(selectedCategory),
        [selectedCategory],
    );

    useEffect(() => {
        if (
            selectedCategory === "all" ||
            selectedPattern.category === selectedCategory
        ) {
            return;
        }

        const fallback = filteredPatterns[0];
        if (fallback) {
            setSelectedPattern(fallback);
        }
    }, [filteredPatterns, selectedCategory, selectedPattern, setSelectedPattern]);

    return {
        selectedCategory,
        setSelectedCategory,
        filteredPatterns,
        getCountForCategory: getPatternCountForCategory,
    };
}

