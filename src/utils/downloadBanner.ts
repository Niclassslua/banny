"use client";

import { toBlob } from "html-to-image";

type DownloadBannerOptions = {
    fileName: string;
    backgroundColor?: string;
};

type ToBlobOptions = { pixelRatio?: number; cacheBust?: boolean; backgroundColor?: string };

const BASE_RENDER_OPTIONS: ToBlobOptions = {
    pixelRatio: 2,
    cacheBust: true,
};

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function withVisibleNode<T>(node: HTMLElement, fn: (n: HTMLElement) => Promise<T>) {
    const prev = {
        position: node.style.position,
        opacity: node.style.opacity,
        transform: node.style.transform,
        width: node.style.width,
        height: node.style.height,
    };

    try {
        node.style.position = node.style.position || "relative";
        node.style.opacity = "1";
        node.style.transform = "none";

        const rect = node.getBoundingClientRect();
        if (rect.width < 1) {
            node.style.width = `${node.offsetWidth || 1}px`;
        }
        if (rect.height < 1) {
            node.style.height = `${node.offsetHeight || 1}px`;
        }

        return await fn(node);
    } finally {
        node.style.position = prev.position;
        node.style.opacity = prev.opacity;
        node.style.transform = prev.transform;
        node.style.width = prev.width;
        node.style.height = prev.height;
    }
}

async function downloadStatic(node: HTMLElement, fileName: string, backgroundColor?: string) {
    const blob = await withVisibleNode(node, async (n) => {
        const renderOptions: ToBlobOptions = {
            ...BASE_RENDER_OPTIONS,
            ...(backgroundColor ? { backgroundColor } : {}),
        };

        const generated = await toBlob(n, renderOptions);
        if (!generated) {
            throw new Error("Konnte kein PNG generieren.");
        }
        return generated;
    });

    triggerDownload(blob, `${fileName}.png`);
}

export async function downloadBanner(
    node: HTMLElement,
    { fileName, backgroundColor }: DownloadBannerOptions,
) {
    const active = document.activeElement as HTMLElement | null;
    if (active && node.contains(active)) {
        active.blur();
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    await downloadStatic(node, fileName, backgroundColor);
}
