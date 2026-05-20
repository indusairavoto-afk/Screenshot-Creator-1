import Link from "next/link";
import {
  Download,
  Smartphone,
  Tablet,
  Layout,
  Palette,
  Upload,
  Zap,
  ArrowRight,
  CheckCircle,
  Globe,
  RotateCcw,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ScreenCraft</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
            <a href="#devices" className="transition-colors hover:text-white">Devices</a>
          </div>
          <Link
            href="/editor"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 active:scale-95"
          >
            Open Editor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[100px]" />
          <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
              <Zap className="h-3.5 w-3.5" />
              Export to App Store &amp; Google Play in one click
            </div>

            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white md:text-7xl">
              Screenshots that{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                sell your app.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
              Design advertisement-style App Store and Google Play screenshots in
              your browser. Export at every required resolution with one click.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/editor"
                className="flex items-center gap-2.5 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-900/50 transition-all hover:bg-violet-500 hover:shadow-violet-800/50 active:scale-95"
              >
                Start designing free <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-base font-semibold text-white/80 transition-all hover:border-white/30 hover:text-white"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              {["No signup required", "Runs in browser", "Export as PNG zip"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-violet-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Editor preview mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-600/20 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-2xl shadow-black/60">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#0d0d14] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-white/40">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  screencraft.app/editor
                </div>
              </div>
              {/* Editor mockup content */}
              <div className="flex h-[420px] overflow-hidden">
                {/* Left sidebar */}
                <div className="w-52 shrink-0 border-r border-white/[0.08] bg-[#0f0f17]">
                  <div className="border-b border-white/[0.08] p-3">
                    <div className="text-xs font-semibold text-white/70">Slides</div>
                    <div className="text-[10px] text-white/30">5 slides · drag to reorder</div>
                  </div>
                  <div className="space-y-1.5 p-2">
                    {[
                      { label: "MEET YOUR APP", bg: "from-violet-600 to-indigo-700", active: true },
                      { label: "FEATURE 01", bg: "from-blue-600 to-cyan-600", active: false },
                      { label: "FEATURE 02", bg: "from-purple-700 to-pink-600", active: false },
                      { label: "FEATURE 03", bg: "from-slate-700 to-slate-800", active: false },
                      { label: "AND MORE", bg: "from-emerald-700 to-teal-600", active: false },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded-lg p-2 ${s.active ? "bg-violet-600/20 ring-1 ring-violet-500/50" : "bg-white/[0.03]"}`}
                      >
                        <div className={`h-10 w-7 shrink-0 rounded bg-gradient-to-b ${s.bg} flex items-center justify-center`}>
                          <Smartphone className="h-3 w-3 text-white/70" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[9px] font-semibold text-white/50">{s.label}</div>
                          <div className="mt-0.5 h-1.5 w-12 rounded-full bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main canvas */}
                <div className="flex flex-1 items-center justify-center bg-[#0a0a12] p-8">
                  <div className="relative flex h-full max-h-80 items-center justify-center">
                    <div className="relative h-72 w-40 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                      <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-violet-400/20 blur-xl" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                        <div className="text-[7px] font-bold uppercase tracking-widest text-violet-200">MEET YOUR APP</div>
                        <div className="mt-1.5 text-[15px] font-extrabold leading-tight text-white">Sell one idea per slide.</div>
                        <div className="mt-3 h-24 w-14 overflow-hidden rounded-lg border border-white/20 bg-white/10">
                          <div className="h-full w-full bg-gradient-to-b from-white/5 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right inspector */}
                <div className="w-56 shrink-0 border-l border-white/[0.08] bg-[#0f0f17]">
                  <div className="border-b border-white/[0.08] p-3">
                    <div className="text-xs font-semibold text-white/70">Slide settings</div>
                    <div className="text-[10px] text-white/30">Hero · Headline above device</div>
                  </div>
                  <div className="space-y-3 p-3">
                    <div>
                      <div className="mb-1 text-[10px] text-white/40">Layout</div>
                      <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60">Hero</div>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] text-white/40">Label</div>
                      <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60">MEET YOUR APP</div>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] text-white/40">Headline</div>
                      <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs leading-relaxed text-white/60">Sell one<br />idea per slide.</div>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] text-white/40">Screenshot</div>
                      <div className="flex items-center gap-2 rounded-md border border-dashed border-white/20 px-2.5 py-2 text-[10px] text-white/30">
                        <Upload className="h-3 w-3" /> Drop image here
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar strip */}
              <div className="flex items-center gap-2 border-t border-white/[0.08] bg-[#0d0d14] px-4 py-2.5">
                <div className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/50">My App</div>
                <div className="h-3 w-px bg-white/15" />
                <div className="flex gap-1">
                  {["iOS", "Android"].map((p) => (
                    <div key={p} className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${p === "iOS" ? "bg-violet-600 text-white" : "bg-white/5 text-white/40"}`}>{p}</div>
                  ))}
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/50">iPhone</div>
                <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white">
                  <Download className="h-3 w-3" /> Export bundle
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload / Get Started */}
      <section className="py-20 border-y border-white/[0.08] bg-[#0d0d14]" id="get-started">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Ready to create your screenshots?</h2>
            <p className="mt-3 max-w-xl text-white/50">
              Open the editor instantly — no account needed. Your work auto-saves in the browser.
            </p>
            <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: <Smartphone className="h-6 w-6" />,
                  title: "Pick your device",
                  desc: "iPhone, iPad, Android phone, tablet, or Feature Graphic banner.",
                },
                {
                  step: "2",
                  icon: <Upload className="h-6 w-6" />,
                  title: "Upload screenshots",
                  desc: "Drop your app screenshots onto each slide. Supports PNG and JPEG.",
                },
                {
                  step: "3",
                  icon: <Download className="h-6 w-6" />,
                  title: "Export bundle",
                  desc: "Download a zip with every required size — ready to upload to the store.",
                },
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <div className="absolute -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                    {s.step}
                  </div>
                  <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                    {s.icon}
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-white/50">{s.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/editor"
              className="mt-10 flex items-center gap-2.5 rounded-xl bg-violet-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-900/50 transition-all hover:bg-violet-500 active:scale-95"
            >
              Open Editor — it&apos;s free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Supported devices */}
      <section className="py-20" id="devices">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">Devices</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">All stores, all sizes, covered.</h2>
            <p className="mt-3 max-w-xl text-white/50">
              Every device Apple and Google require. Switch between them in the toolbar — each has its own independent slide deck.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: <Smartphone className="h-7 w-7" />, name: "iPhone", sub: "Apple App Store", colorFrom: "from-blue-600/20", colorTo: "to-blue-700/10", border: "border-blue-500/20", text: "text-blue-400" },
              { icon: <Tablet className="h-7 w-7" />, name: "iPad", sub: "Apple App Store", colorFrom: "from-cyan-600/20", colorTo: "to-cyan-700/10", border: "border-cyan-500/20", text: "text-cyan-400" },
              { icon: <Smartphone className="h-7 w-7" />, name: "Android Phone", sub: "Google Play", colorFrom: "from-green-600/20", colorTo: "to-green-700/10", border: "border-green-500/20", text: "text-green-400" },
              { icon: <Tablet className="h-7 w-7" />, name: 'Android 7"', sub: "Google Play", colorFrom: "from-emerald-600/20", colorTo: "to-emerald-700/10", border: "border-emerald-500/20", text: "text-emerald-400" },
              { icon: <Tablet className="h-7 w-7" />, name: 'Android 10"', sub: "Google Play", colorFrom: "from-teal-600/20", colorTo: "to-teal-700/10", border: "border-teal-500/20", text: "text-teal-400" },
              { icon: <Layout className="h-7 w-7" />, name: "Feature Graphic", sub: "1024×500 banner", colorFrom: "from-violet-600/20", colorTo: "to-violet-700/10", border: "border-violet-500/20", text: "text-violet-400" },
            ].map((d) => (
              <div key={d.name} className={`flex flex-col items-center rounded-2xl border ${d.border} bg-gradient-to-b ${d.colorFrom} ${d.colorTo} p-5 text-center`}>
                <div className={d.text}>{d.icon}</div>
                <div className="mt-3 text-sm font-semibold text-white">{d.name}</div>
                <div className="mt-1 text-[11px] text-white/40">{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/[0.08] bg-[#0d0d14]" id="features">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">Features</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Everything you need to ship.</h2>
            <p className="mt-3 max-w-xl text-white/50">Built for indie developers who need great screenshots without a design team.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Zap className="h-5 w-5" />, title: "Live preview at full resolution", desc: "The canvas renders at the true export size, scaled to fit your screen. No guessing — what you see is what you export.", color: "text-yellow-400 bg-yellow-400/10" },
              { icon: <Download className="h-5 w-5" />, title: "Bulk export in one click", desc: "Hit Export bundle and get a zip with every Apple and Google required resolution for the selected device.", color: "text-green-400 bg-green-400/10" },
              { icon: <Upload className="h-5 w-5" />, title: "Drag-and-drop screenshots", desc: "Drop PNG or JPEG files directly onto slides. Uploaded screenshots are saved to disk and git-trackable.", color: "text-blue-400 bg-blue-400/10" },
              { icon: <Layout className="h-5 w-5" />, title: "7 slide layouts", desc: "Hero, device-bottom, device-top, two-devices, no-device, split-landscape, and feature-graphic. Mix them for visual rhythm.", color: "text-purple-400 bg-purple-400/10" },
              { icon: <Palette className="h-5 w-5" />, title: "4 built-in themes", desc: "Clean Light, Dark Bold, Warm Editorial, and Ocean Fresh. Switch themes in the toolbar to instantly preview the vibe.", color: "text-pink-400 bg-pink-400/10" },
              { icon: <Globe className="h-5 w-5" />, title: "Multi-locale support", desc: "Add multiple language locales. The export bundles all locales × all required sizes automatically.", color: "text-indigo-400 bg-indigo-400/10" },
              { icon: <RotateCcw className="h-5 w-5" />, title: "Undo / redo everywhere", desc: "Full history with Cmd+Z and Shift+Cmd+Z. 50-step undo buffer so you can freely experiment.", color: "text-orange-400 bg-orange-400/10" },
              { icon: <Smartphone className="h-5 w-5" />, title: "iOS & Android side-by-side", desc: "Separate slide decks for each platform. Switch with a tab click — each deck is independently editable.", color: "text-cyan-400 bg-cyan-400/10" },
              { icon: <CheckCircle className="h-5 w-5" />, title: "Auto-saves to disk", desc: "Your project auto-saves to app-store-screenshots.json every 600ms. Commit it and resume from any machine.", color: "text-emerald-400 bg-emerald-400/10" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:border-white/15 hover:bg-white/5">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">How it works</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">From idea to published in minutes.</h2>
          </div>
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute left-[22px] top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-violet-500 via-indigo-500 to-transparent md:left-1/2" />
            <div className="space-y-12">
              {[
                { n: "01", title: "Open the editor", desc: "No sign-up, no installation. Open in your browser and start immediately with a pre-built starter deck.", side: "right" },
                { n: "02", title: "Configure your app", desc: "Type your app name in the toolbar, pick a theme, then switch between iPhone and Android to work on each platform deck.", side: "left" },
                { n: "03", title: "Drop your screenshots", desc: "Drag your device capture PNGs into each slide. Edit the headline and label directly on the canvas — click to type.", side: "right" },
                { n: "04", title: "Export & upload", desc: "Click Export bundle. A zip downloads with every Apple and Google required size, organized by device and locale.", side: "left" },
              ].map((step, i) => (
                <div key={i} className={`relative flex items-start gap-6 ${step.side === "left" ? "md:flex-row-reverse md:text-right" : ""}`}>
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-500/50 bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-900/50">
                    {step.n}
                  </div>
                  <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:w-[calc(50%-3rem)] ${step.side === "left" ? "md:mr-auto" : "md:ml-auto"}`}>
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.08] bg-[#0d0d14] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Your screenshots are one
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              click away.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/50">
            Free, runs in your browser, auto-saves your work. Start now — no account required.
          </p>
          <Link
            href="/editor"
            className="mt-10 inline-flex items-center gap-2.5 rounded-xl bg-violet-600 px-9 py-4 text-lg font-bold text-white shadow-xl shadow-violet-900/50 transition-all hover:bg-violet-500 active:scale-95"
          >
            Open the Editor <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Smartphone className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">ScreenCraft</span>
          </div>
          <p className="text-sm text-white/30">
            Built with the{" "}
            <a href="https://github.com/ParthJadhav/app-store-screenshots" className="text-violet-400 hover:underline" target="_blank" rel="noreferrer">
              app-store-screenshots
            </a>{" "}
            skill by Parth Jadhav.
          </p>
          <Link href="/editor" className="text-sm font-semibold text-violet-400 transition-colors hover:text-violet-300">
            Open Editor →
          </Link>
        </div>
      </footer>
    </div>
  );
}
