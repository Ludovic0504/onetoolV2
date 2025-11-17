import { useMemo, useState, useRef, useEffect } from "react";
import PageTitle from "../composants/interface/TitrePage";
import { Video as VideoIcon, Sparkles, Copy, Trash2, Search, X, History, Zap, Wand2, Check, Play } from "lucide-react";

const FORMAT_OPTIONS = [
  { value: "16:9", label: "16:9", icon: "▭" },
  { value: "9:16", label: "9:16", icon: "▯" },
  { value: "1:1", label: "1:1", icon: "▢" },
  { value: "21:9", label: "21:9", icon: "▬" },
  { value: "4:5", label: "4:5", icon: "▬" },
];

const DURATION_OPTIONS = {
  veo3: ["8s"],
  sora2: ["10s", "15s"],
};

const LS_KEY = "history_v2";
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveHistory(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}
function addHistoryEntry(entry) {
  const items = loadHistory();
  saveHistory([{ ...entry, pinned: false }, ...items]);
  window.dispatchEvent(new Event("onetool:history:changed"));
}
function getVideoHistory() {
  return loadHistory().filter((i) => i.kind === "video");
}

export default function Video() {
  const [tab, setTab] = useState("veo3");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <PageTitle
          green="Vidéos"
          white="Génération"
          subtitle="Crée des vidéos avec l'intelligence artificielle."
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
</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === "veo3" ? <VEO3VideoForm /> : <Sora2VideoForm />}
        </div>

        <div className="lg:col-span-1">
          <RightPanel model={tab} />
        </div>
      </div>
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

function VEO3VideoForm() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState("16:9");
  const [duration, setDuration] = useState("8s");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const abortRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    const refresh = () => {
      window.dispatchEvent(new Event("onetool:history:changed"));
    };
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, [output]);

  const generate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setOutput("");
    setCopied(false);

    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const generatedOutput = `[SCENE]
${idea}

[SETTINGS]
- Format: ${format}
- Duration: ${duration}
- Style: Cinematic
- Quality: High

[VIDEO_PROMPT]
Detailed video description based on your idea...`;
      
      setOutput(generatedOutput);
      
                  addHistoryEntry({
                    id: crypto.randomUUID?.() || String(Date.now()),
                    kind: "video",
                    input: idea,
        output: generatedOutput,
          model: "veo3",
          createdAt: new Date().toISOString(),
        });
    } catch (e) {
      setOutput("⚠️ Erreur : " + (e?.message || String(e)));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort?.();
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

  return (
    <>
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <VideoIcon className="w-4 h-4 text-emerald-400" />
          Description de la vidéo
        </label>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
          className="w-full rounded-lg border border-white/10 p-4 min-h-[180px] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none bg-white/5"
          placeholder="Décris la vidéo (scène, style, ambiance…) — ex : vlog nerveux sous la pluie dans un fast-food néon, caméra tremblante, ambiance cinématique..."
        />
        <p className="mt-2 text-xs text-gray-400">
          Sois précis : style, sujet, mouvement, ambiance, lumière.
        </p>
      </div>

      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Paramètres</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Format</label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === opt.value
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/10"
                  }`}
         >
                  <span className="block">{opt.icon}</span>
                  <span className="text-xs mt-0.5">{opt.label}</span>
                </button>
            ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Durée</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
         >
            {DURATION_OPTIONS.veo3.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0C1116]">
                  {opt}
                </option>
            ))}
          </select>
          </div>
        </div>
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
              Générer la vidéo
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
              <Play className="w-4 h-4 text-emerald-400" />
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
            <VideoIcon className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            Saisis ta description ci-dessus et génère ta vidéo
          </p>
        </div>
      )}
    </>
  );
}

function Sora2VideoForm() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState("16:9");
  const [duration, setDuration] = useState("10s");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const abortRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    const refresh = () => {
      window.dispatchEvent(new Event("onetool:history:changed"));
    };
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, [output]);

  const generate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setOutput("");
    setCopied(false);

    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const generatedOutput = `[SCENE]
${idea}

[SETTINGS]
- Format: ${format}
- Duration: ${duration}
- Style: Cinematic
- Quality: High

[SORA2_PROMPT]
Detailed video description for Sora2 based on your idea...`;
      
      setOutput(generatedOutput);
      
                  addHistoryEntry({
                    id: crypto.randomUUID?.() || String(Date.now()),
                    kind: "video",
                    input: idea,
        output: generatedOutput,
          model: "sora2",
          createdAt: new Date().toISOString(),
        });
    } catch (e) {
      setOutput("⚠️ Erreur : " + (e?.message || String(e)));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort?.();
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

 return (
  <>
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <VideoIcon className="w-4 h-4 text-emerald-400" />
          Description de la vidéo
        </label>
    <textarea
  value={idea}
  onChange={(e) => setIdea(e.target.value)}
          className="w-full rounded-lg border border-white/10 p-4 min-h-[180px] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none bg-white/5"
          placeholder="Décris la vidéo pour Sora2 (format / plans / ambiance)…"
        />
        <p className="mt-2 text-xs text-gray-400">
          Sois précis : style, sujet, mouvement, ambiance, lumière.
        </p>
      </div>

      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Paramètres</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Format</label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === opt.value
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/10"
                  }`}
      >
                  <span className="block">{opt.icon}</span>
                  <span className="text-xs mt-0.5">{opt.label}</span>
                </button>
        ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Durée</label>
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
      >
        {DURATION_OPTIONS.sora2.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0C1116]">
            {opt}
          </option>
        ))}
      </select>
          </div>
        </div>
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
              Générer la vidéo
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
              <Play className="w-4 h-4 text-emerald-400" />
              Prompt généré (Sora2)
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
            <VideoIcon className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            Saisis ta description ci-dessus et génère ta vidéo
          </p>
        </div>
      )}
  </>
);
}

function RightPanel({ model }) {
  const [items, setItems] = useState(() => getVideoHistory());
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => {
      const all = getVideoHistory();
      const filtered = all.filter((i) => (i.model || "").toLowerCase() === model);
      setItems(filtered);
    };
    refresh();
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, [model]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
          (i) =>
            (i.input || "").toLowerCase().includes(t) ||
            (i.output || "").toLowerCase().includes(t)
        );
  }, [items, q]);

  const removeOne = (id) => {
    const all = loadHistory();
    saveHistory(all.filter((i) => i.id !== id));
    setItems(getVideoHistory().filter((i) => (i.model || "").toLowerCase() === model));
  };

  const loadIntoEditor = (item) => {
    window.dispatchEvent(
      new CustomEvent("onetool:video:load", {
        detail: { input: item.input, output: item.output },
      })
    );
  };

  return (
    <div className="glass-strong rounded-xl p-6 border border-white/10 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          Historique {model.toUpperCase()}
        </h2>
      </div>

      {items.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
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
      </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <VideoIcon className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            {q ? "Aucun résultat trouvé" : "Aucune vidéo générée"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {q ? "" : "Tes vidéos apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {filtered.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-emerald-500/50 transition-all bg-white/5 p-3"
            >
              <button
                onClick={() => loadIntoEditor(item)}
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
  );
}
