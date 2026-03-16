import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Users, FileText, ClipboardList, History, Home, Clock, Settings, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#1B3A24] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" data-testid="app-title">
              EasyQuote Work
            </h1>
            <p className="text-sm text-slate-300" data-testid="app-subtitle">Gestione preventivi e report ore</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 mr-2">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-white/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium mr-2">{user.name}</span>
              </div>
            )}
            <Link
              to="/impostazioni"
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Impostazioni"
              data-testid="settings-link"
            >
              <Settings size={22} />
            </Link>
            <button
              onClick={logout}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Esci"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-50"
        data-testid="bottom-navigation"
      >
        <div className="container mx-auto px-1">
          <div className="flex justify-around items-center h-16">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-home"
            >
              <Home size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Home</span>
            </Link>

            <Link
              to="/clienti"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/clienti") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-customers"
            >
              <Users size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Clienti</span>
            </Link>

            <Link
              to="/listino"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/listino") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-pricelist"
            >
              <FileText size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Listino</span>
            </Link>

            <Link
              to="/nuovo-preventivo"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/nuovo-preventivo") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-new-quote"
            >
              <ClipboardList size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Prev.</span>
            </Link>

            <Link
              to="/storico"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/storico") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-history"
            >
              <History size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Storico</span>
            </Link>

            <Link
              to="/report-ore"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive("/report-ore") ? "text-[#1B3A24]" : "text-slate-600"
              }`}
              data-testid="nav-work-reports"
            >
              <Clock size={22} strokeWidth={1.5} />
              <span className="text-xs mt-1">Report</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
