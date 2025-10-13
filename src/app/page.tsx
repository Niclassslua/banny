"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Ruler, Type } from "lucide-react";

const features = [
    {
        title: "Schriftgröße",
        description:
            "Feinjustiere Größen und Proportionen – für perfekte Typografie in jedem Banner.",
        icon: Ruler,
    },
    {
        title: "24+ Schriftarten",
        description:
            "Entdecke charakterstarke Fonts – von klaren Sans bis verspielten Scripts.",
        icon: Type,
    },
    {
        title: "20+ Banner",
        description:
            "Wähle aus modernen Vorlagen – individuell anpassbar mit einem Klick.",
        icon: Layers,
    },
];

const Page = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
            {/* Background orbs – Banny-Blue */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#A1E2F8]/25 blur-3xl" />
                <div className="absolute top-1/4 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#A1E2F8]/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#A1E2F8]/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-12 md:px-10 lg:px-16">
                {/* Navigation */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[#A1E2F8]/25 bg-[#A1E2F8]/5 text-3xl font-semibold uppercase tracking-[0.3em] text-white/80 shadow-2xl shadow-[0_20px_60px_-20px_rgba(192,230,244,0.45)]">
                            <img src="/bunny.png" alt="Logo" className="h-24 w-24" />
                        </div>
                        <div>
              <span className="text-base uppercase tracking-[0.45em] text-[#A1E2F8]">
                Banner Creator
              </span>
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                Banny
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="space-y-10">
                    <div className="space-y-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                            className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl"
                        >
                            Dein kleiner Designfreund mit großem Geschmack.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="max-w-xl text-lg leading-relaxed text-white/80"
                        >
                            Banny kombiniert dynamisches Design mit intuitiver Bedienung. In
                            wenigen Klicks setzt du farbenstarke Visuals in Szene.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href="/creator"
                                className="inline-flex items-center gap-3 rounded-full bg-[#A1E2F8]/30 px-8 py-4 text-base font-semibold text-[#A1E2F8] backdrop-blur-md shadow-[0_0_25px_-5px_rgba(192,230,244,0.8)] transition-all hover:scale-105 hover:bg-[#A1E2F8]/40 hover:text-white hover:shadow-[0_0_45px_-5px_rgba(192,230,244,1)]"
                            >
                                Launch den Creator
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="space-y-16">
                    <div className="flex items-center gap-3 text-white/60">
                        <Layers className="h-5 w-5 text-[#A1E2F8]" />
                        <span className="text-xs uppercase tracking-[0.4em] text-[#A1E2F8]">
              Features
            </span>
                    </div>

                    <h2 className="text-3xl font-semibold md:text-4xl">
                        Mehr Charakter in jedem Banner
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                whileHover={{ y: -6 }}
                                className="group relative overflow-hidden rounded-3xl border border-[#A1E2F8]/25 bg-white/[0.04] p-8 backdrop-blur"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-[#A1E2F8]/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                                <feature.icon className="h-10 w-10 text-[#A1E2F8]" />
                                <h3 className="mt-6 text-xl font-semibold text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-white/75">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Page;