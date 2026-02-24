import { patterns } from "@/constants/patterns";
import type { Pattern, PatternCategoryId } from "@/types";

export type PatternFilterCategory = "all" | PatternCategoryId;

const CATEGORY_COUNT_BASE: Record<PatternCategoryId, number> = {
    atmospheric: 0,
    radial: 0,
    geometric: 0,
    angular: 0,
    organic: 0,
    playful: 0,
};

export const PATTERN_CATEGORY_COUNTS: Record<PatternCategoryId, number> =
    patterns.reduce<Record<PatternCategoryId, number>>((acc, pattern) => {
        acc[pattern.category] += 1;
        return acc;
    }, { ...CATEGORY_COUNT_BASE });

export function filterPatternsByCategory(
    category: PatternFilterCategory,
): Pattern[] {
    if (category === "all") {
        return patterns;
    }

    return patterns.filter((pattern) => pattern.category === category);
}

export function getPatternCountForCategory(category: PatternFilterCategory): number {
    if (category === "all") {
        return patterns.length;
    }

    return PATTERN_CATEGORY_COUNTS[category];
}

