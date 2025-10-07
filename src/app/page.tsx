"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Palette, Rocket, Ruler, Stars, Type } from "lucide-react";

const heroStats = [
    { label: "Unique Banner Presets", value: "150+" },
    { label: "Export Quality", value: "4K" },
    { label: "Satisfied Creators", value: "25K" },
];

const features = [
    {
        title: "Schriftstil",
        description:
            "Setze Headlines, Claims und CTA-Texte mit feinfühligen Typo-Controls in Szene.",
        icon: Type,
    },
    {
        title: "Schriftgröße",
        description:
            "Passe Größen, Abstände und Rhythmus präzise an, damit jede Zeile perfekt sitzt.",
        icon: Ruler,
    },
    {
        title: "15+ Schriftarten",
        description:
            "Wähle aus einer kuratierten Bibliothek, abgestimmt auf Marken mit Charakter.",
        icon: Palette,
    },
    {
        title: "20+ Banner",
        description:
            "Starte mit wandelbaren Vorlagen für Launches, Drops, Events und mehr.",
        icon: Layers,
    },
];

const Page = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
            {/* Background orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-3xl" />
                <div className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-12 md:px-10 lg:px-16">
                {/* Navigation */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/5 text-2xl font-semibold uppercase tracking-[0.3em] text-white/80 shadow-xl shadow-indigo-500/10">
                            Logo
                        </div>
                        <div>
                            <span className="text-sm uppercase tracking-[0.4em] text-white/60">Banny</span>
                            <h1 className="text-2xl font-semibold">Banner Alchemy Studio</h1>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="space-y-10">
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70"
                        >
                            <Stars className="h-4 w-4 text-indigo-300" />
                            Banny — der Creator für magnetische Banner
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                            className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl"
                        >
                            Kreiere Banner, die Geschichten erzählen und Communities entzünden.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="max-w-xl text-lg leading-relaxed text-white/70"
                        >
                            Banny kombiniert dynamisches Design mit intuitiver Bedienung. In wenigen Klicks setzt du farbenstarke Visuals in Szene, synchronisiert mit deiner Marke und bereit für jeden Launch.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href="#"
                                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-1 hover:shadow-2xl"
                            >
                                Launch den Creator
                                <Rocket className="h-4 w-4" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-white/40 hover:text-white"
                            >
                                Studio-Stimmungen ansehen
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                            className="grid grid-cols-1 gap-4 text-white/70 sm:grid-cols-3"
                        >
                            {heroStats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="text-3xl font-semibold text-white">{stat.value}</div>
                                    <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="space-y-16">
                    <div className="flex items-center gap-3 text-white/60">
                        <Layers className="h-5 w-5" />
                        <span className="text-xs uppercase tracking-[0.4em]">Features</span>
                    </div>
                    <h2 className="text-3xl font-semibold md:text-4xl">Mehr Charakter in jedem Banner</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                whileHover={{ y: -6 }}
                                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 transition group-hover:opacity-100" />
                                <feature.icon className="h-10 w-10 text-indigo-300" />
                                <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                                <p className="mt-4 text-sm leading-relaxed text-white/70">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Page;
