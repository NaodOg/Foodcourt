import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const houses = useQuery(api.houses.getAllHouses);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("adminAuthenticated") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const houseSlug = params.houseSlug;
  const currentHouse = houses?.find(h => h.slug === houseSlug);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return null;

  // No house selected in URL → show house picker
  if (!houseSlug) {
    return (
      <div className="min-h-screen bg-[#f3faff] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg border-2 border-[#b7102a]/20">
              <img src="/logos/flint-court.jpg" alt="Flint" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-black text-3xl text-[#b7102a] uppercase tracking-tighter italic">
              Flint Food Court
            </h1>
            <p className="text-[#5b403f] mt-2 font-body-md">Select a house to manage</p>
          </div>
          {houses === undefined ? (
            <div className="flex justify-center">
              <span className="material-symbols-outlined animate-spin text-[#b7102a] text-4xl">autorenew</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {houses.map(house => (
                <button
                  key={house._id}
                  onClick={() => navigate(`/admin/${house.slug}/dashboard`)}
                  className="bg-white rounded-2xl border border-[#c6e8f8] overflow-hidden hover:shadow-lg transition-all text-left group active:scale-[0.98]"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={house.logo} alt={house.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-white uppercase text-sm drop-shadow-md">
                        {house.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-[#5b403f] font-label-bold">Manage</span>
                    <span className="material-symbols-outlined text-[#b7102a] text-[20px]">chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-error font-label-bold hover:bg-error-container px-4 py-2 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // House selected → show normal admin layout
  const navItems = [
    { path: `/admin/${houseSlug}/dashboard`, label: 'Dashboard', icon: 'dashboard' },
    { path: `/admin/${houseSlug}/dishes`, label: 'Dishes', icon: 'restaurant_menu' },
    { path: `/admin/${houseSlug}/categories`, label: 'Categories', icon: 'category' },
    { path: `/admin/${houseSlug}/settings`, label: 'Settings', icon: 'settings' },
  ];

  const currentPage = navItems.find(item => location.pathname === item.path)?.label || 'Admin';

  return (
    <div className="min-h-screen bg-creamy flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-variant transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-variant shrink-0">
          {currentHouse && (
            <img src={currentHouse.logo} alt={currentHouse.name} className="w-8 h-8 rounded-lg object-cover" />
          )}
          <span className="font-headline-md uppercase text-brand-red text-sm leading-tight">
            {currentHouse?.name || 'Admin'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'text-secondary hover:bg-surface-container-low hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-surface-variant space-y-1">
            <Link
              to={`/admin/${houseSlug}/dashboard`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold text-secondary hover:bg-surface-container-low hover:text-on-background transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Switch House
            </Link>
            <Link
              to="/waiter"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold text-secondary hover:bg-surface-container-low hover:text-on-background transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              Waiter Scanner
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-surface-variant shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold text-error hover:bg-error-container transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-surface-variant flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden material-symbols-outlined text-secondary hover:text-on-background transition-colors"
            >
              menu
            </button>
            <h1 className="font-headline-md text-xl text-on-background">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/menu/${houseSlug}`}
              target="_blank"
              className="text-secondary text-sm hover:text-brand-red transition-colors font-label-bold inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              View Menu
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet context={{ houseSlug, houseId: currentHouse?._id }} />
        </main>
      </div>
    </div>
  );
}
