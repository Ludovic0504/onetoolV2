import { useEffect, useState, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, FileText, Image as ImageIcon, Video, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexte/FournisseurAuth";
import Footer from "@/composants/disposition/PiedDePage";

const navLinks = [
  { path: "/", label: "Accueil" },
  { path: "/lab", label: "Nouveautés" },
  { path: "/prompt", label: "Créer un texte" },
  { path: "/image", label: "Créer une image" },
  { path: "/video", label: "Créer une vidéo" },
  { path: "/a-savoir", label: "Informations utiles" },
];

export default function Accueil() {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["texte", "image", "vidéo"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: FileText, label: "Texte", color: "cyan", path: "/prompt" },
    { icon: ImageIcon, label: "Image", color: "violet", path: "/image" },
    { icon: Video, label: "Vidéo", color: "yellow", path: "/video" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || (path !== "/lab" && location.pathname.startsWith(path));
  };

  const handleLogout = async () => {
    try {
      await signOut?.();
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1116] via-[#0a0f14] to-[#080b10]" />
        
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/4 left-0 w-full h-96 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-3xl animate-wave1" />
          <div className="absolute top-1/2 left-0 w-full h-96 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent blur-3xl animate-wave2" />
          <div className="absolute bottom-1/4 left-0 w-full h-96 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-3xl animate-wave3" />
        </div>

        {useMemo(() => {
          // Générer les positions une seule fois avec useMemo pour éviter les re-renders
          return Array.from({ length: 30 }, (_, i) => {
            const colors = ['rgba(65, 209, 255, 0.4)', 'rgba(189, 52, 254, 0.4)', 'rgba(255, 234, 131, 0.4)'];
            const color = colors[i % 3];
            const left = (i * 13.7) % 95;
            const top = (i * 19.3) % 90;
            const duration = 6 + (i % 4) * 1.5;
            const delay = (i * 0.1) % 3;
            return { i, color, left, top, duration, delay };
          });
        }, []).map(({ i, color, left, top, duration, delay }) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: color,
              left: `${left}%`,
              top: `${top}%`,
              animation: `float ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              boxShadow: `0 0 6px ${color}`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0C1116]/30 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="group z-10 flex-shrink-0">
            <span className="text-xl font-black bg-gradient-to-r from-cyan-300 via-violet-300 to-yellow-300 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-violet-200 group-hover:to-yellow-200 transition-all">
              OneTool
            </span>
          </Link>

            <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`relative text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      active
                        ? "text-emerald-300"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {active && (
                      <>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 z-10 flex-shrink-0">
              {session ? (
                <>
                  {session.user?.email && (
                    <Link
                      to="/profil"
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                      title="Voir mon profil"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-emerald-300 transition-colors" />
                      <span className="text-xs text-gray-300 font-medium truncate max-w-[120px] group-hover:text-gray-200 transition-colors">
                        {session.user.email.split('@')[0]}
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                    title="Se déconnecter"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-5xl mx-auto text-center w-full">
          <div className="mb-10 sm:mb-14">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 leading-none tracking-tight">
              <span className="text-gray-100 block mb-2">Créez votre</span>
              <span className="relative inline-block">
                <span 
                  key={currentWord}
                  className="inline-block bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-400 bg-clip-text text-transparent animate-fadeIn"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradient 3s ease infinite'
                  }}
                >
                  {words[currentWord]}
                </span>
                <span className="inline-block w-1 h-12 sm:h-16 md:h-20 bg-emerald-400 ml-3 animate-blink" />
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-400 font-light mt-4">
              avec l'intelligence artificielle
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-2xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = words[currentWord] === feature.label.toLowerCase();
              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className={`group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 transition-all duration-500 ${
                    isActive
                      ? `border-${feature.color}-500/50 bg-${feature.color}-500/10 scale-110 shadow-[0_0_30px_rgba(var(--${feature.color}-500),0.3)]`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-105'
                  }`}
                  style={{
                    '--cyan-500': '65, 209, 255',
                    '--violet-500': '189, 52, 254',
                    '--yellow-500': '255, 234, 131'
                  }}
                >
                  {isActive && (
                    <div 
                      className={`absolute inset-0 rounded-2xl bg-${feature.color}-500/20 blur-xl animate-pulse`}
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                  
                  <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
                    isActive 
                      ? `bg-${feature.color}-500/20 border-2 border-${feature.color}-500/50`
                      : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
                  }`}>
                    <Icon 
                      className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-500 ${
                        isActive 
                          ? `text-${feature.color}-300 scale-110`
                          : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                    />
                  </div>
                  
                  <span className={`text-sm sm:text-base font-medium transition-all duration-500 ${
                    isActive 
                      ? `text-${feature.color}-300`
                      : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {feature.label}
                  </span>

                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-progress" />
                  )}
                </Link>
              );
            })}
          </div>

          <p className="text-base sm:text-lg text-gray-500 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Transformez vos idées en contenu professionnel en quelques secondes. 
            Que ce soit un texte, une image ou une vidéo, l'IA fait le travail pour vous.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={session ? "/prompt" : "/login"}
              className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-xl hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95"
            >
              <span>{session ? "Commencer" : "Se connecter"}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-15px) translateX(8px);
            opacity: 0.8;
          }
        }
        @keyframes wave1 {
          0%, 100% { transform: translateX(-30%) translateY(0); opacity: 0.15; }
          50% { transform: translateX(30%) translateY(-20px); opacity: 0.2; }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(30%) translateY(0); opacity: 0.15; }
          50% { transform: translateX(-30%) translateY(20px); opacity: 0.2; }
        }
        @keyframes wave3 {
          0%, 100% { transform: translateX(-20%) translateY(0); opacity: 0.15; }
          50% { transform: translateX(20%) translateY(-15px); opacity: 0.2; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .animate-wave1 {
          animation: wave1 12s ease-in-out infinite;
        }
        .animate-wave2 {
          animation: wave2 14s ease-in-out infinite;
        }
        .animate-wave3 {
          animation: wave3 16s ease-in-out infinite;
        }
      `}</style>

      <Footer />
    </div>
  );
}
