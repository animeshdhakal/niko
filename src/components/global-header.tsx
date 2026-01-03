"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUI } from "@/components/providers/UIProvider";
import { Pin, PinOff } from "lucide-react";

export function GlobalHeader() {
    const { user, signOut } = useAuth();
    const { isStickyNav, toggleStickyNav } = useUI();
    const pathname = usePathname();

    // Hide header on login, signup, and dashboard pages
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isDashboardPage = pathname?.startsWith("/dashboard") || pathname?.startsWith("/appointments") || pathname?.startsWith("/hospitals") || pathname?.startsWith("/settings");

    if (isAuthPage || isDashboardPage) return null;

    return (
        <>
            {/* Official Red Banner */}
            <div className="bg-nepal-red text-white py-2">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex items-center justify-between text-[10px] md:text-xs">
                        <span className="font-medium">नेपाल सरकार | Government of Nepal</span>
                        <span className="font-medium uppercase tracking-tighter">स्वास्थ्य तथा जनसंख्या मन्त्रालय</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ${isStickyNav ? 'sticky top-0 shadow-md' : ''}`}>
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                            <Image
                                src="/nepal-emblem.svg"
                                alt="Nepal Government"
                                width={50}
                                height={50}
                                className="drop-shadow-sm"
                            />
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-nepal-blue-dark dark:text-white leading-none mb-1">
                                    NIKO <span className="text-nepal-red ml-1">निको</span>
                                </h1>
                                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-black">
                                    Health Intelligence Grid
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3 md:gap-5">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <nav className="hidden md:flex items-center gap-6 mr-4 border-r pr-6 border-slate-200 dark:border-slate-700">
                                        <Link href="/dashboard" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-nepal-blue transition-colors">
                                            Dashboard
                                        </Link>
                                    </nav>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 hidden xl:inline-block font-bold">
                                            {user.email}
                                        </span>
                                        <Button variant="outline" size="sm" onClick={() => signOut()} className="border-nepal-red text-nepal-red hover:bg-nepal-red hover:text-white px-4 py-1 h-8 text-xs font-black transition-all">
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Link href="/login">
                                        <Button className="bg-nepal-blue hover:bg-nepal-blue-dark h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm font-black shadow-lg shadow-nepal-blue/10 transition-all">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/signup" className="hidden sm:block">
                                        <Button variant="outline" className="border-nepal-blue text-nepal-blue hover:bg-nepal-blue/5 h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm font-black transition-all">
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            <div className="flex items-center gap-2 border-l pl-3 md:pl-5 border-slate-200 dark:border-slate-700">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleStickyNav}
                                    title={isStickyNav ? "Disable Sticky Nav" : "Enable Sticky Nav"}
                                    className="h-9 w-9 text-slate-400 hover:text-nepal-blue hover:bg-nepal-blue/5"
                                >
                                    {isStickyNav ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                                </Button>
                                <ModeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
