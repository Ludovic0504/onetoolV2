import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexte/FournisseurAuth";
import PageTitle from "../composants/interface/TitrePage";
import { Image as ImageIcon, Sparkles, X, Download, Trash2, Upload } from "lucide-react";

const DEFAULT_CREDITS = 20;
const COST_PER_IMAGE = 1;

function userKey(uid) {
  return uid ? `u:${uid}` : "guest";
}
function loadCredits(uid) {
  try {
    const raw = localStorage.getItem(`credits:${userKey(uid)}`);
    if (raw == null) {
      localStorage.setItem(`credits:${userKey(uid)}`, String(DEFAULT_CREDITS));
      return DEFAULT_CREDITS;
    }
    return Number(raw) || 0;
  } catch {
    return 0;
  }
}
function saveCredits(uid, value) {
  try {
    localStorage.setItem(`credits:${userKey(uid)}`, String(value));
  } catch {  }
}

const LS_HISTORY = "history_v2";
function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveHistory(items) {
  try {
    localStorage.setItem(LS_HISTORY, JSON.stringify(items));
  } catch {}
}
function addImageHistory({ uid, prompt, urls, meta }) {
  const id = crypto.randomUUID?.() || String(Date.now());
  const createdAt = new Date().toISOString();
  const entry = {
    id,
    kind: "image",
    prompt,
    output: null,
    urls,
    meta,
    createdAt,
    pinned: false,
    owner: userKey(uid),
  };
  const items = loadHistory();
  saveHistory([entry, ...items]);
}
function getMyImages(uid) {
  const me = userKey(uid);
  return loadHistory().filter((i) => i.kind === "image" && i.owner === me);
}

export default function ImagePage() {
  const { session } = useAuth();
  const uid = session?.user?.id;

  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [quantity, setQuantity] = useState(4);
  const [model] = useState("Image-01");
  const [refCharDataUrl, setRefCharDataUrl] = useState(null);
  const [busy, setBusy] = useState(false);

  const [items, setItems] = useState(() => getMyImages(uid));
  const [credits, setCredits] = useState(() => loadCredits(uid));
  
  useEffect(() => {
    setCredits(loadCredits(uid));
    setItems(getMyImages(uid));
  }, [uid]);

  const totalCost = useMemo(() => COST_PER_IMAGE * Number(quantity || 0), [quantity]);
  const canGenerate = useMemo(() => {
    return !!prompt.trim() && !busy && credits >= totalCost;
  }, [prompt, busy, credits, totalCost]);

  const fileInputRef = useRef(null);
  const onPickRefImage = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setRefCharDataUrl(String(rd.result));
    rd.readAsDataURL(f);
  };

  async function generate() {
    if (!canGenerate) return;

    setBusy(true);
    try {
      const res = await fetch("/api/hailuo-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ratio,
          quantity,
          model,
          refCharacter: refCharDataUrl,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Erreur de génération");
      }

      const data = await res.json().catch(() => null);
      const urls = Array.isArray(data?.urls) ? data.urls : [];

      if (urls.length === 0) {
        throw new Error("Aucune image reçue");
      }

      addImageHistory({
        uid,
        prompt,
        urls,
        meta: { ratio, model, quantity },
      });
      setItems(getMyImages(uid));

      const newCredits = credits - urls.length * COST_PER_IMAGE;
      setCredits(newCredits);
      saveCredits(uid, newCredits);

      setPrompt("");
    } catch (err) {
      alert(err?.message || "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  const resetRef = () => setRefCharDataUrl(null);

  const removeOne = (id) => {
    const all = loadHistory();
    saveHistory(all.filter((i) => i.id !== id));
    setItems(getMyImages(uid));
  };

  const clearAllMine = () => {
    const me = userKey(uid);
    const all = loadHistory();
    saveHistory(all.filter((i) => !(i.kind === "image" && i.owner === me && !i.pinned)));
    setItems(getMyImages(uid));
  };

  const ratioOptions = [
    { value: "16:9", label: "16:9", icon: "▭" },
    { value: "1:1", label: "1:1", icon: "▢" },
    { value: "9:16", label: "9:16", icon: "▯" },
    { value: "4:5", label: "4:5", icon: "▬" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <PageTitle
          green="Images"
          white="Génération"
          subtitle="Transforme tes idées en images avec l'intelligence artificielle."
        />

        <div className="flex items-center gap-3">
          <div className="glass-strong px-4 py-2 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-200">
                <span className="text-emerald-400 font-semibold">{credits}</span> crédits
          </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Description de l'image
            </label>
            <textarea
              className="w-full rounded-lg p-4 min-h-[160px] bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              placeholder="Décris l'image que tu veux créer… Ex: 'Un paysage montagneux au coucher du soleil avec des couleurs vives, style réaliste'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-400">
              Sois précis : style, sujet, lumière, ambiance, couleurs.
            </p>
          </div>

          <div className="glass-strong rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Image de référence (optionnel)
              </label>
              {refCharDataUrl && (
                <button
                  onClick={resetRef}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Retirer
                </button>
              )}
            </div>

            {refCharDataUrl ? (
              <div className="relative w-full overflow-hidden rounded-lg border border-white/10 group">
                <img
                  src={refCharDataUrl}
                  alt="Référence"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={resetRef}
                    className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm text-white transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onPickRefImage}
                className="w-full rounded-lg p-8 border-2 border-dashed border-white/20 hover:border-emerald-500/50 bg-white/5 hover:bg-white/10 transition-all text-center group"
              >
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm text-gray-400 group-hover:text-gray-300">
                  Clique pour ajouter une image de référence
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pour guider le style ou le visage
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          <div className="glass-strong rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Paramètres</h3>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs text-gray-400 mb-2">Format</label>
                <div className="flex gap-2">
                  {ratioOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRatio(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ratio === opt.value
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
                <label className="block text-xs text-gray-400 mb-2">Quantité</label>
              <select
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n} className="bg-[#0C1116]">
                      {n} image{n > 1 ? "s" : ""}
                    </option>
                ))}
              </select>
            </div>
          </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Modèle : <span className="text-gray-300 font-medium">{model}</span></span>
                <span>Coût : <span className="text-emerald-400 font-semibold">{totalCost} crédit{totalCost > 1 ? "s" : ""}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={generate}
              disabled={!canGenerate}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                canGenerate
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95"
                  : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
              }`}
              title={credits < totalCost ? "Crédits insuffisants" : !prompt.trim() ? "Saisis une description" : ""}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération en cours…
                </span>
              ) : (
                `Générer ${quantity} image${quantity > 1 ? "s" : ""}`
              )}
            </button>
            <button
              onClick={() => {
                setPrompt("");
                setRefCharDataUrl(null);
              }}
              className="px-4 py-3 rounded-lg font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all active:scale-95"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-strong rounded-xl p-6 border border-white/10 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Mes créations
              </h2>
              {items.length > 0 && (
    <button
                  onClick={clearAllMine}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  title="Supprimer toutes les images"
    >
                  <Trash2 className="w-3 h-3" />
    </button>
              )}
  </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">
                  Aucune image générée
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tes créations apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {items.slice(0, 12).map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-emerald-500/50 transition-all bg-white/5"
                  >
                    <div className="aspect-square relative">
                      {item.urls?.[0] ? (
            <img
                          src={item.urls[0]}
                          alt={item.prompt || "Création"}
                          className="w-full h-full object-cover"
              loading="lazy"
            />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <ImageIcon className="w-8 h-8 text-gray-500" />
          </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs text-white line-clamp-2 mb-2">
                            {item.prompt || "Sans description"}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-gray-300">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {item.meta?.ratio || "16:9"}
            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeOne(item.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="Supprimer"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
          </div>
      ))}
              </div>
  )}
          </div>
    </div> 
  </div> 
</div>    
);
}
