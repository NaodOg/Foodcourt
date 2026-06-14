import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });

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
    <header className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-[#f3faff] dark:bg-zinc-950 border-b-2 border-[#c6e8f8] dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <img src="/logos/flint-court.jpg" alt="Flint Food Court" className="h-10 w-10 rounded-xl object-cover" />
        <span className="font-['Plus_Jakarta_Sans'] font-black text-xl text-[#b7102a] dark:text-red-500 italic uppercase tracking-tighter">
          Flint Food Court
        </span>
      </div>
      <button
        onClick={() => setIsDarkMode(prev => !prev)}
        className="flex items-center gap-2 active:scale-95 transition-transform duration-150 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[#b7102a] dark:text-red-500 text-[28px]">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </header>
  );
}

function HouseCard({ house, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-[#c6e8f8] dark:border-zinc-700 transition-all hover:-translate-y-2 hover:shadow-xl cursor-pointer active:scale-[0.98] flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={house.logo}
          alt={house.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-white uppercase drop-shadow-md">
            {house.name}
          </h3>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[#5b403f] dark:text-zinc-400 font-body-md mb-5 flex-1">
          {house.description}
        </p>
        <button
          onClick={onClick}
          className="w-full font-label-bold py-3 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: house.accentColor }}
        >
          View Menu
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default function HouseSelector() {
  const navigate = useNavigate();
  const houses = useQuery(api.houses.getActiveHouses);
  const isLoading = houses === undefined;

  return (
    <div className="min-h-[100dvh] bg-[#f3faff] dark:bg-zinc-950 transition-colors duration-300">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Hero */}
        <section className="text-center pt-12 pb-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 shadow-xl border-2 border-[#b7102a]/20">
            <img src="/logos/flint-court.jpg" alt="Flint Food Court" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-black text-4xl md:text-5xl text-[#b7102a] dark:text-red-500 italic uppercase tracking-tighter mb-3">
            Flint Food Court
          </h1>
          <p className="text-[#5b403f] dark:text-zinc-400 font-body-md text-lg max-w-xl mx-auto">
            Three unique kitchens. One unforgettable dining experience. Pick your house and explore the flavors.
          </p>
        </section>

        {/* Houses Grid */}
        <section className="mt-12">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <p className="text-[#b7102a] font-label-bold text-lg animate-pulse">loading...</p>
            </div>
          ) : houses.length === 0 ? (
            <div className="text-center p-12 text-[#5b403f] dark:text-zinc-400 font-label-bold bg-white dark:bg-zinc-900 rounded-2xl border border-[#c6e8f8] dark:border-zinc-700">
              No houses available yet. Seed data from the admin panel to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {houses.map((house) => (
                <HouseCard
                  key={house._id}
                  house={house}
                  onClick={() => navigate(`/menu/${house.slug}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center border-t border-[#c6e8f8] dark:border-zinc-800 pt-8">
          <p className="text-[#5b403f] dark:text-zinc-500 font-label-bold text-sm uppercase tracking-wide">
            Flint Food Court · Good Food, Good Vibes
          </p>
        </footer>
      </main>
    </div>
  );
}
