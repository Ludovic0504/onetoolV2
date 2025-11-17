import { useMemo, useState, useRef, useEffect } from "react";
import { saveHistory, listHistory } from "@/bibliotheque/supabase/historique";
import { useAuth } from "@/contexte/FournisseurAuth";
import PageTitle from "../composants/interface/TitrePage";
import { FileText, Sparkles, Copy, Trash2, Search, X, History, Wand2, Check, BookOpen, Zap } from "lucide-react";

const LS_KEY = "history_v2";
function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalHistory(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}
function addHistoryEntry(entry) {
  const items = loadHistory();
  saveLocalHistory([{ ...entry, pinned: false }, ...items]);
}
function getPromptHistory() {
  return loadHistory().filter((i) => i.kind === "prompt");
}

export default function PromptAssistant() {
  const [tab, setTab] = useState("veo3");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <PageTitle
        green="Prompts"
        white="Assistant"
          subtitle="Transforme tes idées en prompts détaillés pour la génération vidéo."
      />

        <div className="glass-strong inline-flex rounded-lg overflow-hidden border border-white/10 p-1">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>
            <Zap className="w-3.5 h-3.5" />
            <span>VEO3</span>
          </TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>
            <Wand2 className="w-3.5 h-3.5" />
            <span>Sora2</span>
          </TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>
            <History className="w-3.5 h-3.5" />
            <span>Historique</span>
          </TabButton>
        </div>
      </div>

      {tab === "veo3" ? <VEO3Generator /> : tab === "sora2" ? <Sora2Placeholder /> : <PromptHistory />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 rounded-md ${
        active
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function VEO3Generator() {
  const { session } = useAuth();
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(() => getPromptHistory());
  const outputRef = useRef(null);
  const prevOutputRef = useRef("");

  useEffect(() => {
    // Ne mettre à jour que si output a vraiment changé et n'est pas vide
    if (output && output !== prevOutputRef.current) {
      prevOutputRef.current = output;
      setItems(getPromptHistory());
    }
  }, [output]);

  const reset = () => {
    setLoading(false);
    setIdea("");
    setOutput("");
    setCopied(false);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Impossible de copier");
    }
  };

  const generate = async () => {
    if (disabled || loading) return;
    
    setLoading(true);
    setOutput("");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedOutput = `[SCENE]
${idea}

[SETTINGS]
- Style: Cinematic
- Quality: High
- Duration: 10s
- Camera: Dynamic tracking

[DIALOGUE]
French dialogue here based on your scene...`;
      
      setOutput(generatedOutput);
      
      addHistoryEntry({
        id: crypto.randomUUID?.() || String(Date.now()),
        kind: "prompt",
        input: idea,
        output: generatedOutput,
        createdAt: new Date().toISOString(),
      });
      setItems(getPromptHistory());
    } catch (err) {
      alert("Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  const removeOne = (id) => {
    const all = loadHistory();
    saveLocalHistory(all.filter((i) => i.id !== id));
    setItems(getPromptHistory());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-strong rounded-xl p-6 border border-white/10">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
  Ton idée (2–3 lignes)
</label>
<textarea
  value={idea}
  onChange={(e) => setIdea(e.target.value)}
            className="w-full rounded-lg border border-white/10 p-4 min-h-[180px] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none bg-white/5"
            placeholder="Ex : Un ado rentre sous la pluie, se parle à la caméra façon vlog, ambiance cinématique avec des reflets sur les vitres, musique douce en arrière-plan..."
/>
          <p className="mt-2 text-xs text-gray-400">
            Décris ta scène de manière naturelle. Le générateur produira un prompt VEO3 détaillé avec sections, dialogues et paramètres.
          </p>
</div>

        <div className="flex items-center gap-3">
        <button
            onClick={generate}
          disabled={disabled || loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              disabled || loading
                ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                : "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95"
            }`}
        >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Générer le prompt
              </>
            )}
        </button>
        <button
          onClick={reset}
            className="px-4 py-3 rounded-lg font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all active:scale-95"
        >
          Réinitialiser
        </button>
      </div>

        {output && (
          <div className="glass-strong rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Prompt généré (VEO3)
              </label>
  <button
    onClick={copy}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
    Copier
                  </>
                )}
  </button>
</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <pre
                ref={outputRef}
                className="whitespace-pre-wrap text-gray-200 text-sm font-mono leading-relaxed"
              >
                {output}
              </pre>
            </div>
          </div>
        )}

        {!output && !loading && (
          <div className="glass-strong rounded-xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Saisis ton idée ci-dessus et génère ton prompt
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="glass-strong rounded-xl p-6 border border-white/10 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Historique récent
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-sm text-gray-400">
                Aucun prompt généré
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tes prompts apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {items.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-emerald-500/50 transition-all bg-white/5 p-3"
                >
                  <button
                    onClick={() => {
                      setIdea(item.input || "");
                      setOutput(item.output || "");
                    }}
                    className="w-full text-left"
                  >
                    <div className="text-xs font-medium text-gray-300 line-clamp-2 mb-2">
                      {item.input || item.output || "Sans titre"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>
                        {new Date(item.created_at || item.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {item.model && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {item.model.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => removeOne(item.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Supprimer"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PromptHistory() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      if (session) {
        try {
        const rows = await listHistory({ kind: "prompt", limit: 50 });
        setItems(rows);
        } catch (err) {
          console.error("Erreur chargement historique:", err);
          setItems(getPromptHistory());
        }
      } else {
        setItems(getPromptHistory());
      }
      setLoading(false);
    })();
  }, [session]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
      (i) =>
        (i.input || "").toLowerCase().includes(t) ||
        (i.output || "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const clearAll = () => {
    if (!confirm("Supprimer tout l'historique ?")) return;
    const all = loadHistory();
    saveLocalHistory(all.filter((i) => i.kind !== "prompt" || i.pinned));
    setItems(getPromptHistory());
  };

  const loadIntoEditor = (i) => {
    window.dispatchEvent(
      new CustomEvent("onetool:prompt:load", {
        detail: { input: i.input, output: i.output },
      })
    );
    alert("Chargé dans l'éditeur ✅ (onglet VEO3)");
  };

  const removeOne = (id) => {
    const all = loadHistory();
    saveLocalHistory(all.filter((i) => i.id !== id));
    setItems(getPromptHistory());
  };

  return (
    <div className="space-y-4">
      <div className="glass-strong rounded-xl p-4 border border-white/10 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher dans l'historique…"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        {items.length > 0 && (
        <button
          onClick={clearAll}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-gray-300 hover:text-red-300 transition-all flex items-center gap-2"
            title="Effacer tout l'historique"
        >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Nettoyer</span>
        </button>
        )}
      </div>

      {loading ? (
        <div className="glass-strong rounded-xl p-12 border border-white/10 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-white/10 border-t-emerald-500/50 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-400">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-xl p-12 border border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <History className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            {q ? "Aucun résultat trouvé" : "Aucun prompt enregistré"}
          </p>
          {q && (
            <button
              onClick={() => setQ("")}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <div
              key={i.id}
              className="glass-strong rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => loadIntoEditor(i)}
                  className="flex-1 text-left hover:opacity-80 transition-opacity"
                  title="Charger dans l'éditeur"
                >
                  <div className="text-sm font-medium text-gray-200 line-clamp-2 mb-2">
                    {i.output || i.input || "Sans titre"}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      {new Date(i.created_at || i.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {i.model && (
                      <>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                          {i.model.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => removeOne(i.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-300"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sora2Placeholder() {
  return (
    <div className="glass-strong rounded-xl p-8 border border-white/10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Wand2 className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Spécialisation Sora2</h3>
      <p className="text-sm text-gray-400 max-w-md mx-auto">
        Le générateur de prompts <strong className="text-emerald-400">Sora2</strong> sera disponible prochainement.
        Dis-moi le format exact voulu, je reproduis la même génération riche.
      </p>
    </div>
  );
}
