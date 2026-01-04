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
            <h1 className="text-3xl md:text-6xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
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
            A unified digital health infrastructure platform designed to
            securely manage health records for citizens, hospitals, and the
            Government of Nepal, ensuring seamless nationwide care.
          </p>
        </div>
      </section>

      {/* Stats Section - Quick Impact Metrics */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Districts Covered", value: "77", sub: "Nationwide" },
              { label: "Hospitals", value: "850+", sub: "Connected" },
              {
                label: "Patient Records",
                value: "2.5M+",
                sub: "Securely Stored",
              },
              { label: "Daily Transactions", value: "15k+", sub: "Real-time" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl md:text-5xl font-black text-nepal-red tabular-nums">
                  {stat.value}
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Transforming Healthcare Delivery
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Leveraging advanced technology to provide secure, efficient, and
              accessible healthcare services for every Nepali citizen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Unified Health Record",
                desc: "A single, digital health profile for every citizen, accessible from any connected hospital nationwide.",
                icon: (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
              {
                title: "AI-Powered Insights",
                desc: "Advanced analytics help doctors diagnose faster and allow the ministry to track public health trends in real-time.",
                icon: (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
              },
              {
                title: "Bank-Grade Security",
                desc: "Built with Government PKI infrastructure to ensure your sensitive medical data is encrypted and private.",
                icon: (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-nepal-red rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Steps */}
      <section className="py-20 bg-white dark:bg-black px-4 border-t border-slate-100 dark:border-slate-900">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                Simple Access for Everyone
              </h2>
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Register or Visit",
                    desc: "Citizens can register online or visit any government hospital to get their unique Niko ID.",
                  },
                  {
                    step: "02",
                    title: "Receive Treatment",
                    desc: "Doctors access your history instantly. Prescriptions and reports are saved digitally.",
                  },
                  {
                    step: "03",
                    title: "Access Anywhere",
                    desc: "View your reports, medical history, and appointments login from your secure portal.",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="text-4xl font-black text-slate-200 dark:text-slate-800 group-hover:text-nepal-red/20 transition-colors">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        {step.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] bg-slate-100 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {/* Placeholder for a UI mockup or illustration */}
              <div className="text-center space-y-4 prose dark:prose-invert">
                <div className="text-nepal-red text-6xl font-black opacity-20">
                  NIKO
                </div>
                <p className="font-medium text-slate-500">
                  Secure Digital Infrastructure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('/nepal-pattern.png')] bg-repeat" />
        <div className="container mx-auto max-w-3xl relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white">
            Ready to access your data?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Secure, Fast, and Reliable. Join the digital health revolution of
            Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-nepal-red hover:bg-red-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-red-500/20 w-full sm:w-auto"
              >
                Login to Portal
              </Button>
            </Link>
            <Link href="#">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-lg px-8 py-6 rounded-xl w-full sm:w-auto bg-transparent transition-colors"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Support / FAQ Teaser */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid gap-6">
            {[
              {
                q: "Is my data safe?",
                a: "Yes. Niko uses government-standard PKI encryption. Only authorized medical professionals can access your records with your consent.",
              },
              {
                q: "How do I get a Niko ID?",
                a: "You can register at your nearest government hospital or ward office. Online self-registration is coming soon.",
              },
              {
                q: "Does it cost money?",
                a: "No. The Niko platform is a free service provided by the Ministry of Health & Population.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                  {faq.q}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section - Compact */}
      <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="font-bold mb-6 text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 relative pb-2">
                Quick Access
                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
              </h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-nepal-red dark:hover:text-white transition-all"
                  >
                    Citizen Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-nepal-red dark:hover:text-white transition-all"
                  >
                    Healthcare Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-nepal-red dark:hover:text-white transition-all"
                  >
                    Ministry Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 relative pb-2">
                Support
                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
              </h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">
                <li className="hover:text-nepal-red dark:hover:text-white cursor-pointer transition-all">
                  User Guidelines
                </li>
                <li className="hover:text-nepal-red dark:hover:text-white cursor-pointer transition-all">
                  Help Center
                </li>
                <li className="hover:text-nepal-red dark:hover:text-white cursor-pointer transition-all">
                  FAQs
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 relative pb-2">
                Contact Info
                <div className="absolute bottom-0 left-0 w-8 h-1 bg-nepal-red rounded-full" />
              </h4>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 text-xs md:text-sm font-medium">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Ministry of Health & Population
                </p>
                <p className="opacity-90">Ramshah Path, Kathmandu, Nepal</p>
                <div className="pt-2 text-[10px] md:text-xs">
                  <p>
                    Email:{" "}
                    <span className="text-slate-700 dark:text-slate-200">
                      info@mohp.gov.np
                    </span>
                  </p>
                  <p>
                    Web:{" "}
                    <span className="text-slate-700 dark:text-slate-200 underline decoration-nepal-blue underline-offset-4 decoration-2">
                      mohp.gov.np
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 dark:text-slate-600 tracking-widest font-bold uppercase">
            <p>© 2026 Government of Nepal • MoHP</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-800 dark:hover:text-slate-400 cursor-pointer">
                Privacy
              </span>
              <span className="hover:text-slate-800 dark:hover:text-slate-400 cursor-pointer">
                Terms
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
