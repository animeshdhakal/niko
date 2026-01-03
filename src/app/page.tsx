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

            {/* Portal Services Section - Professional "Lower Page" Design */}
            <section className="py-24 md:py-32 px-4 bg-white dark:bg-slate-950 relative overflow-hidden">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                            Portal Services
                        </h2>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] text-[10px] md:text-xs font-black">
                                विश्वसनीय सरकारी स्वास्थ्य सेवाहरू
                            </p>
                            <div className="w-24 h-1.5 bg-nepal-red rounded-full" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 md:gap-12">
                        {/* Service Cards - Refined Professional Style */}
                        {[
                            {
                                id: "01",
                                title: "Citizens",
                                subtitle: "नागरिक पोर्टल",
                                features: [
                                    { name: "Digital Health ID", desc: "Unique health identity" },
                                    { name: "Medical Records", desc: "Access history safely" },
                                    { name: "Appointments", desc: "Online scheduling" }
                                ],
                                color: "nepal-blue"
                            },
                            {
                                id: "02",
                                title: "Providers",
                                subtitle: "स्वास्थ्यकर्मी पोर्टल",
                                features: [
                                    { name: "Clinical Manager", desc: "Patient record control" },
                                    { name: "E-Prescriptions", desc: "Digital prescriptions" },
                                    { name: "Lab Hub", desc: "Real-time results" }
                                ],
                                color: "nepal-blue"
                            },
                            {
                                id: "03",
                                title: "Ministry",
                                subtitle: "मन्त्रालय पोर्टल",
                                features: [
                                    { name: "Epidemic Grid", desc: "Disease tracking" },
                                    { name: "Health Analytics", desc: "Data driven policy" },
                                    { name: "Resource Board", desc: "National monitoring" }
                                ],
                                color: "nepal-red"
                            }
                        ].map((portal) => (
                            <div key={portal.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all duration-500 flex flex-col group">
                                <div className="text-sm font-black text-slate-200 dark:text-slate-800 mb-6 tracking-[0.4em]">{portal.id}</div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                    {portal.title}
                                </h3>
                                <p className="text-[10px] font-bold text-nepal-blue dark:text-blue-400 uppercase tracking-widest mb-8">{portal.subtitle}</p>

                                <ul className="space-y-6 mb-12 flex-1">
                                    {portal.features.map((f, i) => (
                                        <li key={i} className="flex flex-col gap-1">
                                            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{f.desc}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/login" className="w-full">
                                    <Button className={`w-full ${portal.color === 'nepal-red' ? 'bg-nepal-red hover:bg-red-700' : 'bg-nepal-blue hover:bg-nepal-blue-dark'} text-white h-14 text-sm font-black rounded-xl shadow-lg transition-all active:scale-95`}>
                                        Open {portal.title} Portal
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
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
