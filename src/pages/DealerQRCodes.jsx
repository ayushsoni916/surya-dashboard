import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search, RefreshCw, Download, QrCode, Eye, X, CheckSquare,
    Square, Loader2, AlertCircle, Copy, ExternalLink, PackageCheck,
} from "lucide-react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { API_BASE } from "../config/api";

// Change only if the public scratch page is deployed under another path.
const SCRATCH_PAGE_URL = "https://b2belectromart.com/";

const POSTER_TEMPLATE = "/lg-diwali-qr-template.png";

const dealerInfo = (dealer) => ({
    id: String(dealer?._id || ""),
    name: String(dealer?.dealerName || "").trim(),
    gtm: String(dealer?.gtmCode || "").trim(),
    city: String(dealer?.address?.city || dealer?.address?.district || "").trim(),
    district: String(dealer?.address?.district || "").trim(),
    status: String(dealer?.status || "").toLowerCase(),
});

function getDealerLink(dealer) {
    const d = dealerInfo(dealer);
    if (!d.gtm || !d.name || !d.city) return null;
    const url = new URL(SCRATCH_PAGE_URL);
    url.searchParams.set("gtmCode", d.gtm);
    url.searchParams.set("dealerName", d.name);
    url.searchParams.set("city", d.city);
    return url.toString();
}

function safeFilename(value) {
    return String(value || "dealer").replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_").slice(0, 50) || "dealer";
}

// Real QR replaces only the square in the selected 1254 x 1254 poster artwork.
// Keep the source PNG at public/lg-diwali-qr-template.png.
function loadTemplate(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Poster image not found. Put lg-diwali-qr-template.png inside public/."));
        img.src = src;
    });
}

async function renderPoster(dealer) {
    const link = getDealerLink(dealer);
    if (!link) throw new Error("Dealer needs GTM code, name and city before creating QR.");

    const template = await loadTemplate(POSTER_TEMPLATE);
    const canvas = document.createElement("canvas");
    canvas.width = template.naturalWidth;
    canvas.height = template.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");

    // Draw the original poster, without recreating or modifying its artwork.
    ctx.drawImage(template, -10, -10);

    // New approved portrait poster: 1122 x 1402.
    // The old artwork was 1254 x 1254, so never scale QR height
    // independently using the old square poster dimensions.
    const isPortrait = canvas.height / canvas.width > 1.12;
    const scale = canvas.width / (isPortrait ? 1122 : 1254);

    const cover = isPortrait
        ? { x: 347, y: 540, w: 407, h: 373, r: 10 }
        : { x: 405, y: 484, w: 435, h: 435, r: 10 };
    const placement = isPortrait
        ? { x: 375, y: 550, size: 350 }
        : { x: 423, y: 500, size: 399 };

    // Cover the old printed dummy QR completely, within the white frame.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(
        cover.x * scale, cover.y * scale,
        cover.w * scale, cover.h * scale, cover.r * scale
    );
    ctx.fill();

    // Draw a square QR with equal X/Y scaling and its built-in quiet zone.
    // Do not overlay a logo: it can make long dealer URLs harder to scan.
    const qrData = await QRCode.toDataURL(link, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qr = await loadTemplate(qrData);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        qr,
        placement.x * scale,
        placement.y * scale,
        placement.size * scale,
        placement.size * scale
    );
    ctx.imageSmoothingEnabled = true;

    return canvas.toDataURL("image/png");
}

function saveDataUrl(url, filename) {
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
}
function dataUrlToBase64(url) { return url.split(",")[1]; }

export default function DealerQRCodes() {
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [status, setStatus] = useState("active");
    const [selected, setSelected] = useState([]);
    const [previewDealer, setPreviewDealer] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [progress, setProgress] = useState("");

    const loadDealers = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API_BASE}/dealers`);
            if (!res.ok) throw new Error(`Could not load dealers (${res.status}).`);
            const json = await res.json();
            const rows = json.data;
            if (!Array.isArray(rows)) throw new Error("Unexpected /dealers API response.");
            setDealers(rows);
        } catch (e) { setError(e.message || "Failed to load dealers."); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadDealers(); }, [loadDealers]);

    const cities = useMemo(() => [...new Set(dealers.map(d => dealerInfo(d).city).filter(Boolean))].sort(), [dealers]);
    const filtered = useMemo(() => dealers.filter(dealer => {
        const d = dealerInfo(dealer);
        const matchSearch = `${d.name} ${d.gtm} ${d.city} ${d.district}`.toLowerCase().includes(query.toLowerCase().trim());
        return matchSearch && (!city || d.city === city) && (!status || d.status === status);
    }), [dealers, query, city, status]);
    const valid = useMemo(() => filtered.filter(d => !!getDealerLink(d)), [filtered]);
    const visibleIds = valid.map(d => dealerInfo(d).id);
    const selectedRows = dealers.filter(d => selected.includes(dealerInfo(d).id) && getDealerLink(d));
    const allVisibleChecked = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));

    async function preview(dealer) {
        setError(""); setBusy("preview");
        try {
            const image = await renderPoster(dealer);
            setPreviewImage(image); setPreviewDealer(dealer);
        } catch (e) { setError(e.message); }
        finally { setBusy(""); }
    }
    async function downloadOne(dealer) {
        setError(""); setBusy(dealerInfo(dealer).id);
        try {
            const poster = await renderPoster(dealer);
            const d = dealerInfo(dealer);
            saveDataUrl(poster, `LG_Diwali_${safeFilename(d.gtm)}_${safeFilename(d.name)}.png`);
        } catch (e) { setError(e.message); }
        finally { setBusy(""); }
    }
    async function downloadZip(rows, label) {
        if (!rows.length) { setError("No valid dealers available for download."); return; }
        setError(""); setBusy("zip"); setProgress(`Preparing 0 / ${rows.length}`);
        try {
            const zip = new JSZip();
            const usedNames = new Set();
            for (let i = 0; i < rows.length; i++) {
                const d = dealerInfo(rows[i]);
                const png = await renderPoster(rows[i]);
                let filename = `${safeFilename(d.gtm)}_${safeFilename(d.name)}.png`;
                if (usedNames.has(filename)) filename = `${safeFilename(d.gtm)}_${safeFilename(d.name)}_${i + 1}.png`;
                usedNames.add(filename);
                zip.file(filename, dataUrlToBase64(png), { base64: true });
                setProgress(`Preparing ${i + 1} / ${rows.length}`);
                // Allow the UI to repaint between large batches.
                if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));
            }
            setProgress("Compressing ZIP...");
            const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 4 } });
            const zipUrl = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = zipUrl; a.download = `LG_Diwali_QR_${label}.zip`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(zipUrl), 60_000);
        } catch (e) { setError(e.message || "ZIP download failed."); }
        finally { setBusy(""); setProgress(""); }
    }
    function toggleOne(id) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
    function toggleVisible() {
        setSelected(prev => allVisibleChecked ? prev.filter(id => !visibleIds.includes(id)) : [...new Set([...prev, ...visibleIds])]);
    }
    async function copyLink(dealer) {
        const url = getDealerLink(dealer);
        if (!url) return setError("Dealer data incomplete.");
        try { await navigator.clipboard.writeText(url); } catch { setError("Copy blocked by browser. Open preview to see the URL."); }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-500">LG Diwali Campaign 2026</p>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2"><QrCode className="text-orange-500" /> Dealer QR Codes</h1>
                    <p className="text-xs text-slate-500 mt-1">Search dealers and download their unique scratch & win posters.</p>
                </div>
                <button onClick={loadDealers} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </header>
            <main className="p-4 sm:p-8 max-w-[1500px] mx-auto space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        ["Total dealers", dealers.length],
                        ["Showing", filtered.length],
                        ["QR ready", valid.length],
                        ["Selected", selectedRows.length],
                    ].map(([label, count]) => <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"><p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-slate-900 mt-1">{count}</p></div>)}
                </div>
                {error && <div role="alert" className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm"><AlertCircle size={18} className="shrink-0" />{error}<button className="ml-auto" onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-lg">
                            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search dealer, GTM, city..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white" />
                        </div>
                        <select value={city} onChange={e => setCity(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm bg-slate-50"><option value="">All cities</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm bg-slate-50"><option value="active">Active dealers</option><option value="">All statuses</option><option value="inactive">Inactive dealers</option></select>
                    </div>
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
                        <button disabled={busy !== "" || valid.length === 0} onClick={toggleVisible} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                            {allVisibleChecked ? <CheckSquare size={17} className="text-orange-600" /> : <Square size={17} />} {allVisibleChecked ? "Unselect visible" : "Select visible"}
                        </button>
                        <div className="flex-1" />
                        <button disabled={busy !== "" || !selectedRows.length} onClick={() => downloadZip(selectedRows, "Selected")} className="inline-flex gap-2 items-center rounded-xl px-4 py-2.5 border border-slate-200 bg-white text-xs font-bold disabled:opacity-40"><Download size={15} /> Selected ZIP ({selectedRows.length})</button>
                        <button disabled={busy !== "" || valid.length === 0} onClick={() => downloadZip(valid, "All_Filtered")} className="inline-flex gap-2 items-center rounded-xl px-4 py-2.5 bg-slate-900 text-white text-xs font-bold disabled:opacity-40"><Download size={15} /> Download All Filtered ZIP</button>
                    </div>
                    {busy === "zip" && <div className="px-5 py-3 text-sm font-bold bg-orange-50 text-orange-700 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> {progress}</div>}
                    {loading ? <div className="py-20 flex justify-center gap-3 items-center text-slate-400"><Loader2 className="animate-spin" /> Loading dealers...</div> : !filtered.length ? <div className="py-20 text-center text-slate-400">No dealers match your filters.</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[740px]">
                                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide font-black text-slate-400"><tr><th className="p-4">Select</th><th className="p-4">Dealer</th><th className="p-4">GTM Code</th><th className="p-4">City</th><th className="p-4">QR Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{filtered.map(dealer => {
                                    const d = dealerInfo(dealer); const ok = !!getDealerLink(dealer); const isSelected = selected.includes(d.id); return <tr key={d.id} className="hover:bg-orange-50/30">
                                        <td className="p-4"><input aria-label={`Select ${d.name}`} type="checkbox" checked={isSelected} disabled={!ok || busy !== ""} onChange={() => toggleOne(d.id)} className="accent-orange-600 w-4 h-4" /></td>
                                        <td className="p-4 font-black text-slate-800 max-w-[260px]">{d.name || "—"}</td><td className="p-4 font-bold text-orange-700">{d.gtm || "—"}</td><td className="p-4 text-slate-600">{d.city || "—"}</td>
                                        <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{ok ? "Ready" : "Missing data"}</span></td>
                                        <td className="p-4"><div className="flex justify-end gap-2">
                                            <button disabled={!ok || busy !== ""} title="Preview QR poster" onClick={() => preview(dealer)} className="p-2.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"><Eye size={17} /></button>
                                            <button disabled={!ok || busy !== ""} title="Copy QR link" onClick={() => copyLink(dealer)} className="p-2.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"><Copy size={17} /></button>
                                            <button disabled={!ok || busy !== ""} title="Download PNG" onClick={() => downloadOne(dealer)} className="flex items-center gap-1 rounded-lg bg-orange-600 text-white px-3 py-2.5 text-xs font-bold disabled:opacity-30">{busy === d.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} PNG</button>
                                        </div></td>
                                    </tr>;
                                })}</tbody>
                            </table>
                        </div>
                    )}
                </section>
                <div className="flex items-start gap-2 text-xs text-slate-500"><PackageCheck size={16} className="shrink-0 text-orange-600" /><span>QR links encode GTM code, dealer name and city, matching the current scratch-page query parameters. Confirm the public website path and test a sample QR before printing. Browser ZIP generation can take time for large selections.</span></div>
            </main>
            {previewDealer && <div className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget) setPreviewDealer(null); }}>
                <div className="bg-white w-full max-w-[620px] max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center gap-3 p-4 border-b border-slate-200"><div className="min-w-0"><h2 className="text-lg font-black truncate">{dealerInfo(previewDealer).name}</h2><p className="text-xs text-slate-500">{dealerInfo(previewDealer).gtm} · {dealerInfo(previewDealer).city}</p></div><button onClick={() => setPreviewDealer(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={20} /></button></div>
                    <div className="overflow-auto flex-1 p-4 bg-slate-100 flex justify-center">{previewImage && <img src={previewImage} alt="Dealer QR poster preview" className="w-full max-w-[420px] h-auto object-contain shadow-xl" />}</div>
                    <div className="p-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-2"><a href={getDealerLink(previewDealer) || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 truncate sm:flex-1 hover:underline">{getDealerLink(previewDealer)} <ExternalLink size={12} className="inline" /></a><button onClick={() => downloadOne(previewDealer)} disabled={busy !== ""} className="bg-orange-600 text-white py-3 px-5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40"><Download size={16} /> Download PNG</button></div>
                </div>
            </div>}
        </div>
    );
}
