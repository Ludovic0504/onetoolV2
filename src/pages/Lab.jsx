import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../composants/interface/TitrePage";
import { 
  Search, X, Rocket, TrendingUp, CheckCircle2, Zap,
  FileText, Image as ImageIcon, Video, Settings, Users, BookOpen,
  History, Calendar, Filter, Sparkles
} from "lucide-react";

const EVENT_TYPES = {
  feature: { 
    label: "Nouvelle fonctionnalité", 
    icon: Rocket, 
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    gradient: "from-emerald-500/20 to-emerald-600/10"
  },
  improvement: { 
    label: "Amélioration", 
    icon: TrendingUp, 
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    gradient: "from-cyan-500/20 to-cyan-600/10"
  },
  fix: { 
    label: "Correction", 
    icon: CheckCircle2, 
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-300",
    gradient: "from-violet-500/20 to-violet-600/10"
  },
  update: { 
    label: "Mise à jour", 
    icon: Zap, 
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    gradient: "from-yellow-500/20 to-yellow-600/10"
  },
};

const ALL_EVENTS = [
  {
    id: "1",
    type: "feature",
    title: "Génération de vidéos avec IA",
    description: "Nouvelle fonctionnalité de création de vidéos avec support des modèles VEO3 et Sora2. Interface intuitive pour générer des vidéos à partir de prompts textuels.",
    date: new Date("2024-12-15"),
    category: "Création",
    link: "/video",
    icon: Video
  },
  {
    id: "2",
    type: "feature",
    title: "Génération d'images avec référence",
    description: "Possibilité d'uploader une image de référence pour guider la génération. Support de multiples formats (16:9, 1:1, 9:16) et historique des créations.",
    date: new Date("2024-12-14"),
    category: "Création",
    link: "/image",
    icon: ImageIcon
  },
  {
    id: "3",
    type: "feature",
    title: "Assistant de génération de prompts",
    description: "Outil intelligent pour créer et optimiser des prompts textuels. Historique complet, export et suggestions automatiques pour améliorer vos prompts.",
    date: new Date("2024-12-13"),
    category: "Création",
    link: "/prompt",
    icon: FileText
  },
  {
    id: "4",
    type: "improvement",
    title: "Page de profil utilisateur",
    description: "Nouvelle page de profil avec statistiques détaillées : nombre de textes, images et vidéos créés. Historique récent et gestion des informations personnelles.",
    date: new Date("2024-12-12"),
    category: "Interface",
    link: "/profil",
    icon: Users
  },
  {
    id: "5",
    type: "improvement",
    title: "Journal des événements",
    description: "Transformation de la page Nouveautés en journal interactif. Suivez l'évolution de la plateforme avec un design moderne et des notifications.",
    date: new Date("2024-12-11"),
    category: "Interface",
    link: "/lab",
    icon: BookOpen
  },
  {
    id: "6",
    type: "improvement",
    title: "Page d'accueil immersive",
    description: "Refonte complète de la page d'accueil avec hero section animée, navigation intégrée et présentation des fonctionnalités principales du site.",
    date: new Date("2024-12-10"),
    category: "Interface",
    link: "/",
    icon: Rocket
  },
  {
    id: "7",
    type: "improvement",
    title: "Historique des créations",
    description: "Sauvegarde automatique de toutes vos créations (textes, images, vidéos) avec possibilité de les consulter, télécharger ou supprimer depuis chaque page.",
    date: new Date("2024-12-09"),
    category: "Fonctionnalité",
    link: null,
    icon: History
  },
  {
    id: "8",
    type: "improvement",
    title: "Navigation unifiée",
    description: "Navigation horizontale intégrée avec header unifié sur toutes les pages. Accès rapide à toutes les fonctionnalités depuis n'importe quelle page.",
    date: new Date("2024-12-08"),
    category: "Interface",
    link: null,
    icon: Settings
  },
  {
    id: "9",
    type: "improvement",
    title: "Page Informations utiles",
    description: "Guide complet avec conseils pratiques pour créer de meilleurs prompts, optimiser vos images et améliorer votre workflow de création.",
    date: new Date("2024-12-07"),
    category: "Ressources",
    link: "/a-savoir",
    icon: FileText
  },
  {
    id: "10",
    type: "fix",
    title: "Correction de l'affichage mobile",
    description: "Résolution des problèmes d'affichage sur mobile et tablette. Interface maintenant parfaitement responsive sur tous les appareils.",
    date: new Date("2024-12-06"),
    category: "Technique",
    link: null,
    icon: CheckCircle2
  },
  {
    id: "11",
    type: "update",
    title: "Amélioration des performances",
    description: "Optimisation du code et réduction du temps de chargement. Meilleure gestion de la mémoire pour une expérience plus fluide.",
    date: new Date("2024-12-05"),
    category: "Technique",
    link: null,
    icon: Zap
  },
  {
    id: "12",
    type: "feature",
    title: "Système d'authentification",
    description: "Mise en place de l'authentification avec Supabase. Créez un compte pour sauvegarder vos créations et accéder à votre historique personnel.",
    date: new Date("2024-12-04"),
    category: "Sécurité",
    link: "/login",
    icon: Settings
  },
];

export default function Lab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    return [...new Set(ALL_EVENTS.map(e => e.category))].sort();
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...ALL_EVENTS].sort((a, b) => b.date - a.date);

    if (selectedType !== "all") {
      filtered = filtered.filter(e => e.type === selectedType);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => e.category === selectedCategory);
}

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedType, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: ALL_EVENTS.length,
      features: ALL_EVENTS.filter(e => e.type === "feature").length,
      improvements: ALL_EVENTS.filter(e => e.type === "improvement").length,
      fixes: ALL_EVENTS.filter(e => e.type === "fix").length,
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageTitle
          green="Journal"
          white="des Événements"
          subtitle="Découvrez l'évolution et les nouveautés de la plateforme"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
          <div className="glass-strong rounded-xl border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">
              {stats.total}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{stats.features}</div>
            <div className="text-sm text-gray-400 mt-1">Fonctionnalités</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-cyan-300">{stats.improvements}</div>
            <div className="text-sm text-gray-400 mt-1">Améliorations</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-violet-300">{stats.fixes}</div>
            <div className="text-sm text-gray-400 mt-1">Corrections</div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 glass-strong border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedType === "all"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "glass-strong border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Tout
            </button>
            {Object.entries(EVENT_TYPES).map(([key, type]) => {
              const Icon = type.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    selectedType === key
                      ? `${type.bg} ${type.border} ${type.text}`
                      : "glass-strong border-white/10 text-gray-300 hover:border-white/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
      </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                selectedCategory === "all"
                  ? "bg-white/10 border-white/30 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              Toutes les catégories
            </button>
            {categories.map((category) => (
          <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  selectedCategory === category
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
          >
                {category}
          </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 via-violet-500/30 to-yellow-500/30 hidden md:block" />

          <div className="space-y-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => {
                const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.update;
                const EventIcon = event.icon || eventType.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-6 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="hidden md:flex items-center justify-center w-16 flex-shrink-0 relative z-10">
                      <div className={`w-4 h-4 rounded-full border-2 ${eventType.border} ${eventType.bg} flex items-center justify-center`}>
                        <EventIcon className={`w-2.5 h-2.5 ${eventType.text}`} />
                      </div>
                    </div>

                    <div className={`flex-1 glass-strong rounded-xl border border-white/10 p-6 hover:border-white/20 hover:bg-white/5 transition-all group-hover:scale-[1.02] ${
                      isEven ? "md:ml-0" : "md:ml-16"
                    }`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg ${eventType.bg} ${eventType.border} border flex items-center justify-center flex-shrink-0`}>
                            <EventIcon className={`w-6 h-6 ${eventType.text}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${eventType.bg} ${eventType.border} border ${eventType.text}`}>
                                {eventType.label}
                              </span>
                              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                                {event.category}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {event.date.toLocaleDateString("fr-FR", { 
                                  day: "numeric", 
                                  month: "long", 
                                  year: "numeric" 
                                })}
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-200 mb-2 group-hover:text-white transition-colors">
                              {event.title}
                            </h3>
                            
                            <p className="text-gray-300 leading-relaxed mb-4">
                              {event.description}
                            </p>
                            
                            {event.link && (
          <Link
                                to={event.link}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors group/link"
          >
                                Découvrir
                                <Sparkles className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
          </Link>
        )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 glass-strong rounded-xl border border-white/10">
                <p className="text-gray-400 text-lg">Aucun événement trouvé</p>
                <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos filtres</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
