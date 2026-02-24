import { FONTS, FONT_CATEGORIES } from "@/constants/fonts";

const SAMPLE_TEXT = "Sphinx of black quartz, judge my vow.";

export default function FontsPage() {
    const fontsByCategory = FONT_CATEGORIES.map((category) => ({
        category,
        fonts: FONTS.filter((font) => font.category === category),
    })).filter((group) => group.fonts.length > 0);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
                <header className="space-y-4 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight">Schriftübersicht</h1>
                    <p className="text-base text-white/70">
                        Alle derzeit verfügbaren Schriften, gruppiert nach Schriftkategorie. Der Beispieltext hilft dir, die
                        Charakteristik der jeweiligen Schrift schnell zu erkennen.
                    </p>
                </header>

                <div className="space-y-12">
                    {fontsByCategory.map((group) => (
                        <section key={group.category} className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
                                    {group.category}
                                </h2>
                                <div className="h-0.5 w-16 bg-gradient-to-r from-white/40 to-transparent" />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {group.fonts.map((font) => (
                                    <article
                                        key={font.name}
                                        className={`rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_10px_40px_-20px_rgba(161,226,248,0.45)] transition hover:border-[#A1E2F8]/40 hover:bg-white/10 ${font.className}`}
                                        style={{ fontFamily: font.style }}
                                    >
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                                            {group.category}
                                        </p>
                                        <h3 className="mt-2 text-2xl font-semibold text-white">{font.name}</h3>
                                        <p className="mt-4 text-lg text-white/80">{SAMPLE_TEXT}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
