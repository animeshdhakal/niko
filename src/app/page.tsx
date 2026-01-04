import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Full-Page Hero Section - Minimal Government Style */}
            <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto max-w-7xl text-center space-y-12">
                    {/* Centered Large Emblem */}
                    <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="relative w-32 h-32 md:w-48 md:h-48 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                            <Image
                                src="/nepal-emblem.svg"
                                alt="Nepal Government Emblem"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Clean Typography Hierarchy */}
                    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <h1 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                            निको - National Integrated Electronic Medical Record System
                        </h1>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-1 bg-nepal-red rounded-full" />
                            <p className="text-nepal-blue dark:text-blue-400 text-xs md:text-base font-black uppercase tracking-[0.2em]">
                                Government of Nepal | Ministry of Health & Population
                            </p>
                        </div>
                    </div>

                    {/* Support Text - Clear and Professional */}
                    <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed text-sm md:text-lg font-medium animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        A unified digital health infrastructure platform designed to securely manage health records
                        for citizens, hospitals, and the Government of Nepal, ensuring seamless nationwide care.
                    </p>
                </div>
            </section>

            {/* Portal Services Section - Removed as per request, just Login */}
            <section className="py-12 flex justify-center">
                <Link href="/login">
                    <Button size="lg" className="bg-nepal-red hover:bg-red-700 text-white font-bold text-lg px-12 py-6 rounded-xl shadow-lg transition-all active:scale-95">
                        Login to Portal
                    </Button>
                </Link>
            </section>

            {/* Footer Section - Compact */}
            <footer className="bg-slate-950 text-white border-t-4 border-nepal-red mt-auto">
                <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
                        <div>
                            <h4 className="font-bold mb-6 text-sm md:text-base text-slate-100 flex items-center gap-2 relative pb-2">
                                Quick Access
                                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
                            </h4>
                            <ul className="space-y-3 text-slate-400 text-xs md:text-sm font-medium">
                                <li><Link href="/login" className="hover:text-white transition-all">Citizen Portal</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-all">Healthcare Portal</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-all">Ministry Portal</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-sm md:text-base text-slate-100 flex items-center gap-2 relative pb-2">
                                Support
                                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
                            </h4>
                            <ul className="space-y-3 text-slate-400 text-xs md:text-sm font-medium">
                                <li className="hover:text-white cursor-pointer transition-all">User Guidelines</li>
                                <li className="hover:text-white cursor-pointer transition-all">Help Center</li>
                                <li className="hover:text-white cursor-pointer transition-all">FAQs</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-sm md:text-base text-slate-100 flex items-center gap-2 relative pb-2">
                                Contact Info
                                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
                            </h4>
                            <div className="text-slate-400 space-y-3 text-xs md:text-sm font-medium">
                                <p className="font-bold text-slate-100 text-sm">Ministry of Health & Population</p>
                                <p className="opacity-90">Ramshah Path, Kathmandu, Nepal</p>
                                <div className="pt-2 text-[10px] md:text-xs">
                                    <p>Email: <span className="text-slate-200">info@mohp.gov.np</span></p>
                                    <p>Web: <span className="text-slate-200 underline decoration-nepal-blue underline-offset-4 decoration-2">mohp.gov.np</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 tracking-widest font-bold uppercase">
                        <p>© 2026 Government of Nepal • MoHP</p>
                        <div className="flex items-center gap-6">
                            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
                            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
