
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Sparkles, FileText, Image as ImageIcon, Video, Info, X } from "lucide-react";

const links = [
  { path: "/", label: "Accueil", icon: Home },
  { path: "/lab", label: "Nouveautés", icon: Sparkles },
  { path: "/prompt", label: "Créer un texte", icon: FileText },
  { path: "/image", label: "Créer une image", icon: ImageIcon },
  { path: "/video", label: "Créer une vidéo", icon: Video },
  { path: "/a-savoir", label: "Informations utiles", icon: Info },
];

export default function SidebarShell({ children, open, onCloseMenu }) {
  const panelRef = useRef(null);
  const location = useLocation();


  useEffect(() => {
    if (open) onCloseMenu?.();
  }, [location.pathname]);


  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const p = panelRef.current;
      if (p && !p.contains(e.target)) onCloseMenu?.();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open, onCloseMenu]);


  useEffect(() => {
    if (open) {
      const html = document.documentElement;
      const prev = html.style.overflow;
      html.style.overflow = "hidden";
      return () => { html.style.overflow = prev; };
    }
  }, [open]);

  const Item = ({ path, label, icon: Icon }) => {
    const location = useLocation();
    const isActive = path === "/" 
      ? location.pathname === "/"
      : location.pathname === path || (path !== "/lab" && location.pathname.startsWith(path));
    
    return (
      <NavLink
        to={path}
        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
         ${isActive
           ? "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
           : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"}`}
      >
        <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
        <span>{label}</span>
      </NavLink>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <aside
        ref={panelRef}
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#0C1116] via-[#0a0f14] to-[#0C1116] border-r border-white/10 transform transform-gpu will-change-transform transition-transform duration-300 z-50 md:hidden shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="h-full text-white overflow-y-auto">
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0C1116]/80 backdrop-blur-sm sticky top-0 z-10">
            <span className="font-semibold text-lg">Navigation</span>
            <button
              onClick={() => onCloseMenu?.()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 active:bg-white/10 transition-all duration-200 hover:scale-105"
              aria-label="Fermer"
            >
              <X size={18} className="text-slate-300" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-4 py-4">
            {links.map((link) => (
              <Item key={link.path} {...link} />
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
