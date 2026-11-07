
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Gift,
    Store,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    X,
    Edit2,
    Power,
    CheckCircle2,
    XCircle,
    Package,
    Boxes,
    AlertCircle,
    Save,
    IndianRupee,
    ImageIcon,
    ChevronDown
} from "lucide-react";

import {
    searchGiftDealers,
    getDealerGiftInventories,
    createDealerGift,
    updateDealerGift,
    addDealerGiftStock,
} from "../api/dealerGiftApi";

const TYPES = [
    { value: "cash_voucher", label: "Cash Voucher" },
    { value: "product", label: "Physical Product" },
    { value: "other", label: "Other" },
];

const money = value =>
    Number(value || 0).toLocaleString("en-IN");

const errorText = error =>
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";

const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const Button = ({ children, ...props }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${props.className || ""}`}
    >
        {children}
    </button>
);

const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${active
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-red-50 text-red-600 border-red-100"
        }`}>
        {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {active ? "Active" : "Inactive"}
    </span>
);

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {title}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
                {value}
            </p>
        </div>
    </div>
);

// Search dealer by GTM code or dealer name.

function DealerPicker({ value, onChange, disabled = false }) {
    const [query, setQuery] = useState("");
    const [dealers, setDealers] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const response = await searchGiftDealers(
                    query.trim()
                );

                if (!cancelled) {
                    setDealers(response.data || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(errorText(err));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, open]);

    const chooseDealer = dealer => {
        onChange(dealer);
        setQuery("");
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(previous => !previous)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-orange-400 transition"
            >
                <div className="min-w-0">
                    {value ? (
                        <>
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {value.dealerName}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                                GTM: {value.gtmCode}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400 font-semibold">
                            Select Dealer
                        </p>
                    )}
                </div>

                <ChevronDown
                    size={17}
                    className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                autoFocus
                                value={query}
                                onChange={event =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search name or GTM..."
                                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-5 flex items-center justify-center gap-2 text-sm text-slate-500">
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Searching...
                            </div>
                        ) : error ? (
                            <p className="p-4 text-sm text-red-600">
                                {error}
                            </p>
                        ) : dealers.length === 0 ? (
                            <p className="p-5 text-center text-sm text-slate-400">
                                {query.trim().length < 2
                                    ? "Type at least 2 characters"
                                    : "No dealers found"}
                            </p>
                        ) : (
                            dealers.map(dealer => (
                                <button
                                    type="button"
                                    key={dealer._id}
                                    onClick={() =>
                                        chooseDealer(dealer)
                                    }
                                    className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-orange-50 transition ${value?._id === dealer._id
                                        ? "bg-orange-50"
                                        : ""
                                        }`}
                                >
                                    <p className="text-sm font-bold text-slate-900">
                                        {dealer.dealerName}
                                    </p>

                                    <p className="text-xs font-semibold text-orange-600 mt-1">
                                        GTM: {dealer.gtmCode}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


function GiftFormModal({ gift, onClose, onSaved }) {
    const editing = Boolean(gift?._id);

    const [dealer, setDealer] = useState(
        editing ? gift.dealer : null
    );

    const [form, setForm] = useState({
        giftName: gift?.giftName || "",
        giftType: gift?.giftType || "cash_voucher",
        value: String(gift?.value ?? ""),
        image: gift?.image || "",
        quantity: "",
        isActive: gift?.isActive ?? true,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const setField = (field, value) =>
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));

    const save = async event => {
        event.preventDefault();
        setError("");

        if (!editing && !dealer?._id) {
            setError("Please select a dealer");
            return;
        }

        if (!form.giftName.trim()) {
            setError("Gift name is required");
            return;
        }

        if (
            form.value === "" ||
            !Number.isFinite(Number(form.value)) ||
            Number(form.value) < 0
        ) {
            setError("Enter a valid gift value");
            return;
        }

        if (
            !editing &&
            (!Number.isSafeInteger(Number(form.quantity)) ||
                Number(form.quantity) <= 0)
        ) {
            setError("Enter a valid stock quantity");
            return;
        }

        const payload = {
            giftName: form.giftName.trim(),
            giftType: form.giftType,
            value: Number(form.value),
            image: form.image.trim(),
            isActive: form.isActive,
        };

        try {
            setSaving(true);

            if (editing) {
                await updateDealerGift(gift._id, payload);
            } else {
                await createDealerGift({
                    ...payload,
                    dealer: dealer._id,
                    quantity: Number(form.quantity),
                });
            }

            await onSaved();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                            Dealer Rewards
                        </p>
                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            {editing ? "Edit Dealer Gift" : "Add Dealer Gift"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center"
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={save} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-xs font-semibold">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <label className="block">
                            <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                Dealer / GTM Code *
                            </span>
                            {editing ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <p className="font-bold text-sm">
                                        {gift.dealer?.dealerName || "Dealer"}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        {gift.dealer?.gtmCode || ""}
                                    </p>
                                </div>
                            ) : (
                                <DealerPicker
                                    value={dealer}
                                    onChange={setDealer}
                                />
                            )}
                        </label>

                        <label className="block">
                            <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                Gift Name *
                            </span>
                            <input
                                className={inputClass}
                                required
                                maxLength={120}
                                placeholder="e.g. ₹1000 Voucher"
                                value={form.giftName}
                                onChange={e => setField("giftName", e.target.value)}
                            />
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label>
                                <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                    Gift Type
                                </span>
                                <select
                                    className={inputClass}
                                    value={form.giftType}
                                    onChange={e => setField("giftType", e.target.value)}
                                >
                                    {TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                    Value (₹)
                                </span>
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={form.value}
                                    onChange={e => setField("value", e.target.value)}
                                />
                            </label>
                        </div>

                        {!editing && (
                            <label className="block">
                                <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                    Initial Stock Quantity *
                                </span>
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    placeholder="e.g. 5"
                                    value={form.quantity}
                                    onChange={e => setField("quantity", e.target.value)}
                                />
                            </label>
                        )}

                        <label className="block">
                            <span className="block text-xs font-black text-slate-500 uppercase mb-2">
                                Gift Image URL
                            </span>
                            <input
                                className={inputClass}
                                type="url"
                                placeholder="https://..."
                                value={form.image}
                                onChange={e => setField("image", e.target.value)}
                            />
                        </label>

                        <label className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div>
                                <p className="text-sm font-black text-slate-800">
                                    Active Gift
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Eligible for scratch rewards
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => setField("isActive", e.target.checked)}
                                className="w-5 h-5 accent-orange-500"
                            />
                        </label>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="border border-slate-200 bg-white text-slate-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-900 text-white"
                        >
                            {saving
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Save size={16} />}
                            {editing ? "Save Changes" : "Create Gift"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddStockModal({ gift, onClose, onSaved }) {
    const [quantity, setQuantity] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const save = async event => {
        event.preventDefault();
        const count = Number(quantity);

        if (!Number.isSafeInteger(count) || count === 0) {
            setError("Enter a valid non-zero quantity");
            return;
        }

        if (count < 0 && Math.abs(count) > gift.remainingQuantity) {
            setError("Cannot reduce more than available stock");
            return;
        }

        try {
            setSaving(true);
            setError("");
            await addDealerGiftStock(gift._id, count);
            await onSaved();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <form
                onSubmit={save}
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black">Add Stock</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {gift.giftName}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} disabled={saving}>
                        <X size={19} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-[10px] uppercase font-black text-orange-600">
                            Current Remaining
                        </p>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                            {gift.remainingQuantity}
                        </p>
                    </div>

                    <label className="block">
                        <span className="block text-xs font-black text-slate-500 mb-2">
                            Stock Adjustment (+ Add / − Reduce)
                        </span>
                        <input
                            autoFocus
                            type="number"
                            // min="1"
                            step="1"
                            required
                            className={inputClass}
                            placeholder="e.g. 50 or -49"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </label>

                    {error && (
                        <p className="text-xs font-bold text-red-600">{error}</p>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="border border-slate-200 bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 text-white"
                    >
                        {saving
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Plus size={16} />}
                        Add Stock
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function DealerGiftInventoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [modal, setModal] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getDealerGiftInventories();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Invalid inventory response");
            }

            setItems(response.data);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return items.filter(item => {
            if (status === "active" && !item.isActive) return false;
            if (status === "inactive" && item.isActive) return false;
            if (status === "out" && item.remainingQuantity > 0) return false;

            const text = [
                item.giftName,
                item.dealer?.dealerName,
                item.dealer?.gtmCode,
                item.giftType,
            ].join(" ").toLowerCase();

            return !q || text.includes(q);
        });
    }, [items, search, status]);

    const stats = useMemo(() => ({
        gifts: items.length,
        dealers: new Set(
            items.map(item => item.dealer?._id).filter(Boolean)
        ).size,
        remaining: items.reduce(
            (sum, item) => sum + Number(item.remainingQuantity || 0), 0
        ),
        outOfStock: items.filter(
            item => item.remainingQuantity === 0
        ).length,
    }), [items]);

    const toggleStatus = async item => {
        if (!window.confirm(
            `${item.isActive ? "Deactivate" : "Activate"} ${item.giftName}?`
        )) return;

        try {
            setUpdatingId(item._id);
            await updateDealerGift(item._id, {
                isActive: !item.isActive,
            });
            await load();
        } catch (err) {
            window.alert(errorText(err));
        } finally {
            setUpdatingId(null);
        }
    };

    const saved = async () => {
        await load();
        setModal(null);
    };

    return (
        <div className="min-h-screen bg-[#F6F7F9] text-slate-900">
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="px-6 lg:px-8 min-h-[74px] py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Store size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">
                                Surya Marketing
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                                Dealer Gift Inventory
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={load}
                            disabled={loading}
                            className="border border-slate-200 bg-white text-slate-600"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </Button>

                        <Button
                            onClick={() => setModal({ type: "create" })}
                            className="bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            <Plus size={17} />
                            Add Dealer Gift
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-5 lg:p-8 max-w-[1700px] mx-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard title="Gift Entries" value={stats.gifts} icon={Gift} />
                    <StatCard title="Contributing Dealers" value={stats.dealers} icon={Store} />
                    <StatCard title="Remaining Units" value={stats.remaining} icon={Boxes} />
                    <StatCard title="Out Of Stock" value={stats.outOfStock} icon={Package} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                className={`${inputClass} pl-11`}
                                placeholder="Search GTM, dealer or gift name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className={inputClass + " lg:w-48"}
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="out">Out of Stock</option>
                        </select>

                        <Button
                            className="border border-slate-200 bg-white text-slate-600"
                            onClick={() => {
                                setSearch("");
                                setStatus("all");
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-black">Dealer Gift Directory</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Limited-stock gifts contributed by individual dealers.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            {filtered.length} Records
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-24 flex flex-col items-center">
                            <Loader2 size={34} className="animate-spin text-orange-500" />
                            <p className="text-xs font-bold text-slate-400 mt-4">
                                Loading inventory...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center px-4">
                            <AlertCircle size={40} className="mx-auto text-red-400" />
                            <p className="mt-4 font-bold">{error}</p>
                            <Button
                                className="bg-slate-900 text-white mt-4"
                                onClick={load}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {[
                                            "Gift",
                                            "Dealer / GTM",
                                            "Value",
                                            "Total",
                                            "Remaining",
                                            "Status",
                                            "Actions",
                                        ].map(heading => (
                                            <th
                                                key={heading}
                                                className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 last:text-right"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(item => (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-slate-50/70 transition"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex gap-3 items-center min-w-[200px]">
                                                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.giftName}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <Gift size={21} className="text-orange-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {item.giftName}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {TYPES.find(t => t.value === item.giftType)?.label || "Gift"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-bold text-sm">
                                                    {item.dealer?.dealerName || "Unknown Dealer"}
                                                </p>
                                                <p className="text-xs text-orange-600 font-bold mt-1">
                                                    {item.dealer?.gtmCode || "No GTM"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center font-black text-sm">
                                                    <IndianRupee size={13} />
                                                    {money(item.value)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-bold text-slate-600">
                                                {item.totalQuantity}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-black ${item.remainingQuantity === 0
                                                    ? "text-red-600"
                                                    : "text-emerald-700"
                                                    }`}>
                                                    {item.remainingQuantity}
                                                </span>
                                                {item.remainingQuantity === 0 && (
                                                    <p className="text-[10px] text-red-500 font-bold mt-1">
                                                        Out of stock
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge active={item.isActive} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => setModal({ type: "stock", gift: item })}
                                                        className="px-3 py-2 border border-orange-200 bg-orange-50 text-orange-700 text-xs"
                                                    >
                                                        <Plus size={13} />
                                                        Stock
                                                    </Button>
                                                    <Button
                                                        onClick={() => setModal({ type: "edit", gift: item })}
                                                        className="px-3 py-2 border border-slate-200 bg-white text-slate-600 text-xs"
                                                    >
                                                        <Edit2 size={13} />
                                                        Edit
                                                    </Button>
                                                    <button
                                                        title={item.isActive ? "Deactivate" : "Activate"}
                                                        disabled={updatingId === item._id}
                                                        onClick={() => toggleStatus(item)}
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center border disabled:opacity-50 ${item.isActive
                                                            ? "bg-red-50 text-red-600 border-red-100"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            }`}
                                                    >
                                                        {updatingId === item._id
                                                            ? <Loader2 size={15} className="animate-spin" />
                                                            : <Power size={15} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <Gift
                                                    size={40}
                                                    className="mx-auto text-slate-300"
                                                />
                                                <p className="font-bold text-slate-600 mt-4">
                                                    No dealer gifts found
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Add gifts for a contributing dealer.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {modal?.type === "create" && (
                <GiftFormModal
                    onClose={() => setModal(null)}
                    onSaved={saved}
                />
            )}

            {modal?.type === "edit" && (
                <GiftFormModal
                    gift={modal.gift}
                    onClose={() => setModal(null)}
                    onSaved={saved}
                />
            )}

            {modal?.type === "stock" && (
                <AddStockModal
                    gift={modal.gift}
                    onClose={() => setModal(null)}
                    onSaved={saved}
                />
            )}
        </div>
    );
}
