
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexte/FournisseurAuth";
import PageTitle from "../composants/interface/TitrePage";
import { listHistory } from "@/bibliotheque/supabase/historique";
import { 
  User, Mail, Calendar, Settings, LogOut, Edit2, Save, X, 
  FileText, Image as ImageIcon, Video, Sparkles, TrendingUp,
  Clock, ExternalLink
} from "lucide-react";

export default function Profil() {
  const { session, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Utilisateur");
  const [stats, setStats] = useState({ prompts: 0, images: 0, videos: 0, total: 0 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadStats();
    }
  }, [session]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const allHistory = await listHistory({ limit: 1000 });
      
      const prompts = allHistory.filter(h => h.kind === "prompt").length;
      const images = allHistory.filter(h => h.kind === "image").length;
      const videos = allHistory.filter(h => h.kind === "video").length;
      
      setStats({
        prompts,
        images,
        videos,
        total: allHistory.length
      });


      const recent = allHistory.slice(0, 5);
      setRecentHistory(recent);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {

    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut?.();
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
  };

  const getKindIcon = (kind) => {
    switch (kind) {
      case "prompt": return <FileText className="w-4 h-4" />;
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getKindLabel = (kind) => {
    switch (kind) {
      case "prompt": return "Texte";
      case "image": return "Image";
      case "video": return "Vidéo";
      default: return kind;
    }
  };

  const getKindPath = (kind) => {
    switch (kind) {
      case "prompt": return "/prompt";
      case "image": return "/image";
      case "video": return "/video";
      default: return "/";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  if (!session) {
    return null;
  }

  const user = session.user;
  const email = user.email;
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Date inconnue";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-strong rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-200">{loading ? "..." : stats.prompts}</p>
          <p className="text-xs text-gray-400 mt-1">Textes créés</p>
        </div>

        <div className="glass-strong rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-violet-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-200">{loading ? "..." : stats.images}</p>
          <p className="text-xs text-gray-400 mt-1">Images créées</p>
        </div>

        <div className="glass-strong rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Video className="w-5 h-5 text-yellow-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-200">{loading ? "..." : stats.videos}</p>
          <p className="text-xs text-gray-400 mt-1">Vidéos créées</p>
        </div>

        <div className="glass-strong rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-200">{loading ? "..." : stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Total créations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-strong rounded-2xl border border-white/10 p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-200">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Compte créé le</p>
                <p className="text-sm font-medium text-gray-200">{createdAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">ID utilisateur</p>
                <p className="text-sm font-medium text-gray-200 font-mono truncate">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Paramètres
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Se déconnecter</span>
                </div>
              </button>
            </div>
          </div>

          <div className="glass-strong rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Historique récent
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : recentHistory.length > 0 ? (
              <div className="space-y-2">
                {recentHistory.map((item, index) => (
                  <Link
                    key={index}
                    to={getKindPath(item.kind)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      {getKindIcon(item.kind)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{getKindLabel(item.kind)}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">Aucun historique</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
