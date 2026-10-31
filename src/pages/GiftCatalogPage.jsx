
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Gift,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    X,
    Edit2,
    Power,
    CheckCircle2,
    XCircle,
    ImageIcon,
    IndianRupee,
    Package,
    Save,
    Infinity as InfinityIcon,
    AlertCircle,
    ChevronRight,
} from "lucide-react";

import {
    getGifts,
    createGift,
    updateGift,
    setGiftActive,
} from "../api/giftCatalogApi";

const TYPES = [
    { value: "cash_voucher", label: "Cash Voucher" },
    { value: "product", label: "Physical Product" },
    { value: "other", label: "Other Gift" },
];

const EMPTY_FORM = {
    name: "",
    description: "",
    giftType: "cash_voucher",
    value: "",
    image: "",
    isActive: true,
};

const formatMoney = value =>
    Number(value || 0).toLocaleString("en-IN");

const typeLabel = value =>
    TYPES.find(item => item.value === value)?.label ||
    "Other";

const getError = error =>
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";

const StatusBadge = ({ active }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${active
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
    >
        {active ? (
            <CheckCircle2 size={12} />
        ) : (
            <XCircle size={12} />
        )}
        {active ? "Active" : "Inactive"}
    </span>
);

const StatCard = ({ label, value, icon: Icon, hint }) => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Icon size={21} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {label}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
                {value}
            </p>
            {hint && (
                <p className="text-[10px] text-slate-400 mt-1">
                    {hint}
                </p>
            )}
        </div>
    </div>
);

const FormField = ({
    label,
    required,
    children,
}) => (
    <label className="block">
        <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
            {label}
            {required && (
                <span className="text-orange-500 ml-1">*</span>
            )}
        </span>
        {children}
    </label>
);

const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition";

const GiftModal = ({
    gift,
    onClose,
    onSaved,
}) => {
    const [form, setForm] = useState(() =>
        gift
            ? {
                name: gift.name || "",
                description: gift.description || "",
                giftType: gift.giftType || "cash_voucher",
                value: String(gift.value ?? ""),
                image: gift.image || "",
                isActive: gift.isActive !== false,
            }
            : { ...EMPTY_FORM }
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const onKeyDown = event => {
            if (event.key === "Escape" && !saving) {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () =>
            window.removeEventListener("keydown", onKeyDown);
    }, [onClose, saving]);

    const update = (field, value) => {
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();

        if (!form.name.trim()) {
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

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                giftType: form.giftType,
                value: Number(form.value),
                image: form.image.trim(),
                isActive: form.isActive,
            };

            if (gift?._id) {
                await updateGift(gift._id, payload);
            } else {
                await createGift(payload);
            }

            await onSaved();
        } catch (err) {
            setError(getError(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={event => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={gift ? "Edit Gift" : "Add Gift"}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col"
            >
                <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">
                            Surya Rewards
                        </p>
                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            {gift ? "Edit Gift" : "Add New Gift"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Unlimited Surya Marketing reward inventory
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-50"
                    >
                        <X size={17} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto flex-1"
                >
                    <div className="p-6 space-y-5">
                        {error && (
                            <div className="flex gap-2 items-start bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-700">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <FormField label="Gift Name" required>
                            <input
                                className={inputClass}
                                placeholder="e.g. ₹500 Gift Voucher"
                                maxLength={120}
                                required
                                value={form.name}
                                onChange={event =>
                                    update("name", event.target.value)
                                }
                            />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Gift Type" required>
                                <select
                                    className={inputClass}
                                    value={form.giftType}
                                    onChange={event =>
                                        update("giftType", event.target.value)
                                    }
                                >
                                    {TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Gift Value (₹)" required>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    className={inputClass}
                                    placeholder="500"
                                    value={form.value}
                                    onChange={event =>
                                        update("value", event.target.value)
                                    }
                                />
                            </FormField>
                        </div>

                        <FormField label="Description">
                            <textarea
                                rows={3}
                                maxLength={500}
                                className={`${inputClass} resize-none`}
                                placeholder="Short description of the gift..."
                                value={form.description}
                                onChange={event =>
                                    update("description", event.target.value)
                                }
                            />
                        </FormField>

                        <FormField label="Gift Image URL">
                            <input
                                type="url"
                                className={inputClass}
                                placeholder="https://example.com/gift.jpg"
                                value={form.image}
                                onChange={event =>
                                    update("image", event.target.value)
                                }
                            />
                        </FormField>

                        {form.image && (
                            <div className="w-full h-36 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                                <img
                                    src={form.image}
                                    alt="Gift preview"
                                    className="max-w-full max-h-full object-contain p-3"
                                    onError={event => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div>
                                <p className="text-sm font-black text-slate-800">
                                    Gift Availability
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Only active gifts can be awarded.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isActive}
                                aria-label="Gift active"
                                onClick={() =>
                                    update("isActive", !form.isActive)
                                }
                                className={`w-12 h-7 rounded-full p-1 transition ${form.isActive
                                        ? "bg-orange-500"
                                        : "bg-slate-300"
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.isActive
                                            ? "translate-x-5"
                                            : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 flex gap-3 items-center">
                            <InfinityIcon
                                size={20}
                                className="text-orange-600 shrink-0"
                            />
                            <p className="text-xs text-orange-800 font-semibold">
                                Surya gifts have unlimited stock. No quantity
                                needs to be entered.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {gift ? "Save Changes" : "Create Gift"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function GiftCatalogPage() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [giftType, setGiftType] = useState("all");
    const [modal, setModal] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const loadGifts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getGifts();

            if (!response?.success || !Array.isArray(response?.data)) {
                throw new Error(
                    response?.message || "Invalid gift catalogue response"
                );
            }

            setGifts(response.data);
        } catch (err) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGifts();
    }, [loadGifts]);

    const stats = useMemo(() => ({
        total: gifts.length,
        active: gifts.filter(gift => gift.isActive).length,
        inactive: gifts.filter(gift => !gift.isActive).length,
    }), [gifts]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return gifts.filter(gift => {
            if (status === "active" && !gift.isActive) return false;
            if (status === "inactive" && gift.isActive) return false;

            if (
                giftType !== "all" &&
                gift.giftType !== giftType
            ) {
                return false;
            }

            if (query) {
                const text = [
                    gift.name,
                    gift.description,
                    gift.giftType,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (!text.includes(query)) return false;
            }

            return true;
        });
    }, [gifts, status, giftType, search]);

    const changeStatus = async gift => {
        const nextStatus = !gift.isActive;

        if (
            !window.confirm(
                `${nextStatus ? "Activate" : "Deactivate"} "${gift.name}"?`
            )
        ) {
            return;
        }

        try {
            setUpdatingId(gift._id);
            await setGiftActive(gift._id, nextStatus);
            await loadGifts();
        } catch (err) {
            window.alert(getError(err));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaved = async () => {
        await loadGifts();
        setModal(null);
    };

    return (
        <div className="min-h-screen bg-[#F6F7F9] text-slate-900">
            {/* HEADER */}

            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="px-6 lg:px-8 min-h-[74px] py-3 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Gift size={22} className="text-white" />
                        </div>

                        <div>
                            <h1 className="font-black text-xl tracking-tight">
                                Surya Marketing
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                                Gift Catalog Management
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadGifts}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            onClick={() =>
                                setModal({ mode: "create", gift: null })
                            }
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black shadow-sm"
                        >
                            <Plus size={17} />
                            Add Gift
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-5 lg:p-8 max-w-[1700px] mx-auto space-y-6">
                {/* SUMMARY */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Gifts"
                        value={stats.total}
                        icon={Gift}
                    />
                    <StatCard
                        label="Active Gifts"
                        value={stats.active}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        label="Inactive Gifts"
                        value={stats.inactive}
                        icon={XCircle}
                    />
                    <StatCard
                        label="Stock Model"
                        value="Unlimited"
                        icon={InfinityIcon}
                        hint="Surya-funded gifts"
                    />
                </div>

                {/* FILTERS */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Search gift name or description..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        <select
                            value={giftType}
                            onChange={event => setGiftType(event.target.value)}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 outline-none"
                        >
                            <option value="all">All Gift Types</option>
                            {TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={event => setStatus(event.target.value)}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button
                            onClick={() => {
                                setSearch("");
                                setStatus("all");
                                setGiftType("all");
                            }}
                            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* TABLE */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-black text-slate-900">
                                Surya Gift Directory
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Manage rewards available to all participating dealers.
                            </p>
                        </div>

                        <span className="text-xs font-black text-slate-500">
                            {filtered.length} Gifts
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-24 flex flex-col items-center">
                            <Loader2
                                size={34}
                                className="animate-spin text-orange-500"
                            />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">
                                Loading Gifts
                            </p>
                        </div>
                    ) : error ? (
                        <div className="py-20 px-4 text-center">
                            <AlertCircle
                                size={38}
                                className="mx-auto text-red-400"
                            />
                            <p className="font-black text-slate-800 mt-4">
                                Unable to load gifts
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                {error}
                            </p>
                            <button
                                onClick={loadGifts}
                                className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        {[
                                            "Gift",
                                            "Gift Type",
                                            "Value",
                                            "Inventory",
                                            "Status",
                                            "Action",
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
                                    {filtered.map(gift => (
                                        <tr
                                            key={gift._id}
                                            className="hover:bg-slate-50/70 transition"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3 min-w-[230px]">
                                                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                                                        {gift.image ? (
                                                            <img
                                                                src={gift.image}
                                                                alt={gift.name}
                                                                className="w-full h-full object-contain"
                                                                onError={event => {
                                                                    event.currentTarget.style.display = "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <Gift
                                                                size={21}
                                                                className="text-orange-500"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-black text-sm text-slate-900">
                                                            {gift.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1 max-w-[300px] truncate">
                                                            {gift.description || "No description"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                                                    {typeLabel(gift.giftType)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center font-black text-sm text-slate-900">
                                                    <IndianRupee size={13} />
                                                    {formatMoney(gift.value)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-bold">
                                                    <InfinityIcon size={16} />
                                                    Unlimited
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge active={gift.isActive} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setModal({
                                                                mode: "edit",
                                                                gift,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-black text-slate-600 hover:border-orange-400 hover:text-orange-600"
                                                    >
                                                        <Edit2 size={13} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        disabled={updatingId === gift._id}
                                                        onClick={() => changeStatus(gift)}
                                                        title={
                                                            gift.isActive
                                                                ? "Deactivate Gift"
                                                                : "Activate Gift"
                                                        }
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center border disabled:opacity-50 ${gift.isActive
                                                                ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                                                                : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            }`}
                                                    >
                                                        {updatingId === gift._id ? (
                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Power size={15} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="py-20 text-center">
                                                    <Gift
                                                        size={42}
                                                        className="mx-auto text-slate-300"
                                                    />
                                                    <p className="font-black text-slate-700 mt-4">
                                                        No gifts found
                                                    </p>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        Try different filters or add your first gift.
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            setModal({
                                                                mode: "create",
                                                                gift: null,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-2 mt-5 text-orange-600 text-sm font-bold"
                                                    >
                                                        Add Gift
                                                        <ChevronRight size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-500">
                                Showing{" "}
                                <strong className="text-slate-900">
                                    {filtered.length}
                                </strong>{" "}
                                of{" "}
                                <strong className="text-slate-900">
                                    {gifts.length}
                                </strong>{" "}
                                gifts
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {modal && (
                <GiftModal
                    key={modal.gift?._id || "new"}
                    gift={modal.gift}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
