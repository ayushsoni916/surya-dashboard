
import { useEffect, useState } from "react";
import {
    Gift,
    Search,
    Store,
    Package,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Ticket,
} from "lucide-react";

import { getScratchRewards } from "../api/scratchRewardApi";

const SOURCE_TABS = [
    { id: "all", label: "All Rewards" },
    { id: "surya", label: "Surya Marketing" },
    { id: "dealer", label: "Dealer Funded" },
];

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatGiftValue = (gift) => {
    if (gift?.giftType === "cash_voucher") {
        return `₹${Number(gift.value || 0).toLocaleString("en-IN")}`;
    }

    return gift?.name || "—";
};

export default function ScratchRewardOrdersPage() {
    const [source, setSource] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const [rewards, setRewards] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        surya: 0,
        dealer: 0,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
        limit: 20,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let cancelled = false;

        const loadRewards = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getScratchRewards({
                    source,
                    search: debouncedSearch,
                    page,
                    limit: 20,
                });

                if (cancelled) return;

                setRewards(response.data || []);
                setStats(
                    response.stats || {
                        total: 0,
                        surya: 0,
                        dealer: 0,
                    }
                );

                setPagination(
                    response.pagination || {
                        page: 1,
                        total: 0,
                        totalPages: 0,
                        limit: 20,
                    }
                );
            } catch (err) {
                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    "Failed to load scratch rewards"
                );

                setRewards([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadRewards();

        return () => {
            cancelled = true;
        };
    }, [source, debouncedSearch, page, refreshKey]);

    const changeSource = (nextSource) => {
        setSource(nextSource);
        setPage(1);
    };

    const statCards = [
        {
            title: "Total Scratch Rewards",
            value: stats.total,
            icon: Gift,
            color: "bg-orange-50 text-orange-600",
        },
        {
            title: "Surya Marketing Gifts",
            value: stats.surya,
            icon: Package,
            color: "bg-blue-50 text-blue-600",
        },
        {
            title: "Dealer Funded Gifts",
            value: stats.dealer,
            icon: Store,
            color: "bg-purple-50 text-purple-600",
        },
    ];

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Scratch Reward Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View customer rewards, dealer gifts and voucher history
                    </p>
                </div>

                <button
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                        {card.value}
                                    </h2>
                                </div>

                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* TABLE CARD */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* TABS */}
                <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
                    {SOURCE_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => changeSource(tab.id)}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${source === tab.id
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* SEARCH */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="relative w-full max-w-md">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer, GTM, mobile, serial..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
                        />
                    </div>

                    <span className="text-sm text-gray-500">
                        {pagination.total} records
                    </span>
                </div>

                {error && (
                    <div className="mx-4 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Customer</th>
                                <th className="px-5 py-4 font-semibold">Dealer</th>
                                <th className="px-5 py-4 font-semibold">Product</th>
                                <th className="px-5 py-4 font-semibold">Gift</th>
                                <th className="px-5 py-4 font-semibold">Source</th>
                                <th className="px-5 py-4 font-semibold">Voucher</th>
                                <th className="px-5 py-4 font-semibold">Status</th>
                                <th className="px-5 py-4 font-semibold">Date</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {!loading &&
                                rewards.map((reward) => (
                                    <tr
                                        key={reward._id}
                                        className="hover:bg-orange-50/30"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {reward.customerName}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {reward.mobileNumber}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-800">
                                                {reward.dealerName}
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-orange-600">
                                                {reward.gtmCode}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {reward.city}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-800">
                                                {reward.productPurchased}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                S/N: {reward.serialNumber}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Gift size={16} className="text-orange-500" />

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {reward.gift?.name || "—"}
                                                    </p>

                                                    {reward.gift?.giftType ===
                                                        "cash_voucher" && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {formatGiftValue(reward.gift)}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {reward.gift?.source === "dealer" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                                    <Store size={12} />
                                                    Dealer
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                                    <Package size={12} />
                                                    Surya
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-gray-700">
                                                <Ticket size={14} className="text-gray-400" />
                                                {reward.voucherCode}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${reward.status === "redeemed"
                                                        ? "bg-green-50 text-green-700"
                                                        : reward.status === "cancelled"
                                                            ? "bg-red-50 text-red-600"
                                                            : "bg-yellow-50 text-yellow-700"
                                                    }`}
                                            >
                                                {reward.status || "assigned"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                                            {formatDate(reward.assignedAt || reward.createdAt)}
                                        </td>
                                    </tr>
                                ))}

                            {loading && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-16 text-center text-sm text-gray-500"
                                    >
                                        Loading scratch rewards...
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && rewards.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-16 text-center"
                                    >
                                        <Gift
                                            size={34}
                                            className="mx-auto mb-3 text-gray-300"
                                        />

                                        <p className="font-semibold text-gray-700">
                                            No scratch rewards found
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Customer rewards will appear here once assigned.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 p-4">
                        <p className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((prev) => prev - 1)}
                                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                disabled={
                                    page >= pagination.totalPages || loading
                                }
                                onClick={() => setPage((prev) => prev + 1)}
                                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
