import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.035] mix-blend-multiply" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      backgroundSize: '256px 256px',
    }} />
  );
}

const FOOD_PATTERN = `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='28' fill='none' stroke='%23b7102a' stroke-width='0.5' opacity='0.12' /%3E%3Ccircle cx='30' cy='30' r='6' fill='%23b7102a' opacity='0.06' /%3E%3Ccircle cx='90' cy='30' r='4' fill='%23b7102a' opacity='0.05' /%3E%3Ccircle cx='30' cy='90' r='5' fill='%23b7102a' opacity='0.05' /%3E%3Ccircle cx='90' cy='90' r='3' fill='%23b7102a' opacity='0.04' /%3E%3Ccircle cx='60' cy='15' r='2' fill='%23b7102a' opacity='0.04' /%3E%3Ccircle cx='60' cy='105' r='2' fill='%23b7102a' opacity='0.04' /%3E%3Ccircle cx='15' cy='60' r='2' fill='%23b7102a' opacity='0.04' /%3E%3Ccircle cx='105' cy='60' r='2' fill='%23b7102a' opacity='0.04' /%3E%3Cpath d='M45 45 Q60 40 75 45' fill='none' stroke='%23b7102a' stroke-width='0.4' opacity='0.07' /%3E%3Cpath d='M45 75 Q60 80 75 75' fill='none' stroke='%23b7102a' stroke-width='0.4' opacity='0.07' /%3E%3C/svg%3E")`;

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-[0_1px_0_rgba(183,16,42,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 shrink-0">
            <img src="/logos/flint-court.jpg" alt="Flint" className="w-full h-full object-cover" />
          </div>
          <span className="font-['Outfit'] font-bold text-sm uppercase tracking-[0.15em] text-[#b7102a] dark:text-red-400">
            Flint
          </span>
        </div>
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined text-[#b7102a] dark:text-red-400 text-xl transition-transform duration-500" style={{
            transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            {isDarkMode ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
      </div>
    </header>
  );
}

function EntryAnimation({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
    >
      {children}
    </div>
  );
}

function HouseCard({ house, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <EntryAnimation delay={200 + index * 150}>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative cursor-pointer active:scale-[0.98] transition-transform duration-200"
      >
        <div
          className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 transition-all duration-700"
          style={{
            boxShadow: hovered
              ? `0 30px 80px -20px ${house.accentColor}40, 0 0 0 1px ${house.accentColor}25`
              : `0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)`,
            transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          }}
        >
          {/* Image */}
          <div className="relative h-56 sm:h-60 md:h-72 overflow-hidden">
            <div
              className="w-full h-full transition-transform duration-1000 ease-out"
              style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            >
              <img
                src={house.logo}
                alt={house.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

            {/* Decorative top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[4px] transition-all duration-700"
              style={{
                backgroundColor: house.accentColor,
                opacity: hovered ? 1 : 0.8,
                boxShadow: hovered ? `0 0 20px ${house.accentColor}60` : 'none',
              }}
            />

            {/* Corner decorative dots */}
            <div className="absolute top-4 right-4 flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* House number badge */}
            <div className="absolute top-5 left-5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-['Outfit'] font-bold tracking-wider backdrop-blur-md"
                style={{
                  backgroundColor: `${house.accentColor}20`,
                  color: house.accentColor,
                  border: `1px solid ${house.accentColor}30`,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>

            {/* House name overlaid */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-6 h-px rounded-full"
                  style={{ backgroundColor: house.accentColor }}
                />
                <span className="text-[10px] font-['Outfit'] font-medium uppercase tracking-[0.25em] text-white/60">
                  {index === 0 ? 'Pizza & Grill' : index === 1 ? 'Mediterranean' : 'Ethiopian'}
                </span>
              </div>
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-white leading-tight drop-shadow-xl">
                {house.name}
              </h2>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[#5f3f3a] dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-['Outfit'] font-light flex-1">
                {house.description}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6 flex items-center gap-4">
              <div
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-['Outfit'] font-medium text-sm text-white transition-all duration-300"
                style={{
                  backgroundColor: house.accentColor,
                  boxShadow: hovered
                    ? `0 12px 32px -8px ${house.accentColor}50`
                    : `0 4px 12px -2px ${house.accentColor}30`,
                  transform: hovered ? 'scale(1.03) translateX(2px)' : 'scale(1)',
                }}
              >
                <span>Explore Menu</span>
                <svg className="w-4 h-4 transition-transform duration-300" style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
}

export default function HouseSelector() {
  const navigate = useNavigate();
  const houses = useQuery(api.houses.getActiveHouses);
  const isLoading = houses === undefined;

  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: '#faf3ea' }}>
      <div className="dark:bg-zinc-950 min-h-[100dvh] transition-colors duration-500 relative" style={{ backgroundImage: FOOD_PATTERN, backgroundSize: '120px 120px' }}>
        <GrainOverlay />
        <Header />

        <main className="relative z-10">
          {/* ───────────── HERO ───────────── */}
          <section className="relative pt-28 pb-8 sm:pt-36 sm:pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl">
                {/* Decorative dot */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#b7102a' }} />
                  <span className="w-8 h-px" style={{ backgroundColor: '#b7102a' }} />
                  <span className="font-['Outfit'] text-[11px] uppercase tracking-[0.25em] font-medium text-[#b7102a]/60 dark:text-red-400/60">
                    Good Food, Good Vibes
                  </span>
                </div>

                <h1 className="font-['DM_Serif_Display'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-[#1b1b1b] dark:text-white">
                  Flint
                  <br />
                  <span className="italic" style={{ color: '#b7102a' }}>Food Court</span>
                </h1>

                {/* Accent dots row */}
                <div className="flex items-center gap-3 mt-8">
                  <span className="w-10 h-px bg-[#b7102a]/30 dark:bg-red-400/30" />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#b7102a' }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00685d' }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8e4e14' }} />
                  <span className="w-10 h-px bg-[#b7102a]/30 dark:bg-red-400/30" />
                </div>
              </div>
            </div>
          </section>

          {/* ───────────── HOUSES ───────────── */}
          <section className="pb-24 sm:pb-32">
            <div className="max-w-7xl mx-auto px-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-[#b7102a] border-t-transparent animate-spin" />
                    <span className="font-['Outfit'] text-sm text-[#5f3f3a]/60 dark:text-zinc-500">Loading houses...</span>
                  </div>
                </div>
              ) : houses.length === 0 ? (
                <div className="text-center py-24">
                  <p className="font-['Outfit'] text-[#5f3f3a]/60 dark:text-zinc-500">No houses available yet. Run the seed mutation to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {houses.map((house, i) => (
                    <div key={house._id}>
                      <HouseCard
                        house={house}
                        index={i}
                        onClick={() => navigate(`/menu/${house.slug}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ───────────── FOOTER ───────────── */}
          <footer className="border-t border-black/5 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-black/5">
                  <img src="/logos/flint-court.jpg" alt="Flint" className="w-full h-full object-cover" />
                </div>
                <span className="font-['Outfit'] text-xs uppercase tracking-[0.15em] text-[#b7102a]/50 dark:text-red-400/50 font-medium">
                  Flint Food Court
                </span>
              </div>
              <p className="font-['Outfit'] text-xs text-[#5f3f3a]/40 dark:text-zinc-600">
                Three kitchens · One place
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
