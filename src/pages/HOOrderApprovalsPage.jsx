
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    ShoppingCart,
    CheckCircle2,
    XCircle,
    Clock3,
    Package,
    ChevronRight,
    X,
    Loader2,
    MapPin,
    UserRound,
    CalendarDays,
} from "lucide-react";

import {
    getHOApprovalOrders,
    updateHOOrderApproval,
} from "../api/hoOrderApprovalApi";

const CONFIG = {
    teamLeader: {
        title: "Team Leader Approvals",
        subtitle: "Review orders approved by salesmen.",
        stage: "pending_team_leader",
        next: "Admin",
    },
    admin: {
        title: "Admin Approvals",
        subtitle: "Review orders approved by team leaders.",
        stage: "pending_admin",
        next: "Warehouse",
    },
    warehouse: {
        title: "Warehouse Approvals",
        subtitle: "Final order verification and approval.",
        stage: "pending_warehouse",
        next: "Final Approval",
    },
};

const STAGES = {
    pending_salesman: "Pending Salesman",
    pending_team_leader: "Pending Team Leader",
    pending_admin: "Pending Admin",
    pending_warehouse: "Pending Warehouse",
    approved: "Approved",
    rejected: "Rejected",
};

const formatPrice = value =>
    Number(value || 0).toLocaleString("en-IN");

const formatDate = value =>
    value
        ? new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "N/A";

const getName = person =>
    person && typeof person === "object"
        ? person.name || "N/A"
        : "N/A";

const DetailSection = ({ title, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-800">
            {title}
        </h3>
        {children}
    </div>
);

export default function HOOrderApprovalsPage({ role }) {
    const config = CONFIG[role];

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [action, setAction] = useState("");
    const [remark, setRemark] = useState("");
    const [actorId, setActorId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getHOApprovalOrders(role);
            setOrders(result.data || []);
        } catch (err) {
            setError(err.message || "Unable to fetch orders");
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        setSelectedOrder(null);
        setAction("");
        setSearch("");
        loadOrders();
    }, [loadOrders]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return orders;

        return orders.filter(order =>
            [
                order.orderNumber,
                order.dealer?.dealerName,
                order.dealer?.contactPerson,
                order.deliveryAddress?.city,
                order.deliveryAddress?.phone,
                ...(order.items || []).map(item => item.title),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [orders, search]);

    const totalValue = orders.reduce(
        (sum, order) =>
            sum + Number(order.pricing?.grandTotal || 0),
        0
    );

    const closeDrawer = () => {
        if (submitting) return;
        setSelectedOrder(null);
        setAction("");
        setRemark("");
    };

    const submitDecision = async () => {
        if (!selectedOrder || !action || submitting) return;

        if (!/^[a-f\d]{24}$/i.test(actorId.trim())) {
            alert("Enter a valid HO Employee ObjectId.");
            return;
        }

        if (action === "rejected" && !remark.trim()) {
            alert("Rejection reason is required.");
            return;
        }

        try {
            setSubmitting(true);

            await updateHOOrderApproval(
                role,
                selectedOrder._id,
                action,
                remark,
                actorId
            );

            closeDrawerAfterSuccess();
            await loadOrders();

            alert(
                action === "approved"
                    ? `Order approved and forwarded to ${config.next}.`
                    : "Order rejected successfully."
            );
        } catch (err) {
            alert(err.message || "Unable to update approval");
        } finally {
            setSubmitting(false);
        }
    };

    const closeDrawerAfterSuccess = () => {
        setSelectedOrder(null);
        setAction("");
        setRemark("");
    };

    if (!config) return null;

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            {/* HEADER */}
            <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-8">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {config.title}
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                        {config.subtitle}
                    </p>
                </div>

                <button
                    onClick={loadOrders}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                </button>
            </header>

            <main className="mx-auto max-w-[1700px] space-y-6 p-8">
                {/* STATS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        {
                            label: "Pending Approvals",
                            value: orders.length,
                            icon: Clock3,
                        },
                        {
                            label: "Total Products",
                            value: orders.reduce(
                                (total, order) =>
                                    total + (order.items?.length || 0),
                                0
                            ),
                            icon: Package,
                        },
                        {
                            label: "Pending Order Value",
                            value: `₹${formatPrice(totalValue)}`,
                            icon: ShoppingCart,
                        },
                    ].map(stat => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        {stat.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                                    <Icon size={21} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ORDERS TABLE */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Pending Orders
                            </h2>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Orders awaiting your decision
                            </p>
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search order, dealer, product..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {error ? (
                        <div className="py-24 text-center">
                            <XCircle
                                size={35}
                                className="mx-auto text-red-400"
                            />
                            <p className="mt-3 text-sm font-semibold text-red-600">
                                {error}
                            </p>
                            <button
                                onClick={loadOrders}
                                className="mt-4 text-sm font-bold text-orange-600"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="animate-spin text-orange-500" />
                        </div>
                    ) : !filtered.length ? (
                        <div className="py-24 text-center">
                            <CheckCircle2
                                size={38}
                                className="mx-auto text-slate-300"
                            />
                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                No pending orders
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        {[
                                            "Order",
                                            "Dealer",
                                            "Salesman",
                                            "Team Leader",
                                            "Products",
                                            "Amount",
                                            "Placed",
                                            "",
                                        ].map((text, index) => (
                                            <th
                                                key={index}
                                                className="whitespace-nowrap px-5 py-4 text-[10px] font-black uppercase tracking-wide text-slate-500"
                                            >
                                                {text}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(order => (
                                        <tr
                                            key={order._id}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setAction("");
                                                setRemark("");
                                            }}
                                            className="cursor-pointer transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-bold text-slate-900">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-700">
                                                {order.dealer?.dealerName || "N/A"}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {getName(
                                                    order.salesman ||
                                                    order.dealer?.salesman
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {getName(order.dealer?.teamLeader)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {order.items?.length || 0}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">
                                                ₹{formatPrice(order.pricing?.grandTotal)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                                                {formatDate(order.placedAt)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <ChevronRight
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ORDER DETAILS DRAWER */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-950/35"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) closeDrawer();
                    }}
                >
                    <div className="flex h-full w-full max-w-[600px] flex-col bg-[#F8F9FB] shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 bg-white p-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Order Details
                                </p>
                                <h2 className="mt-2 text-xl font-black text-slate-900">
                                    {selectedOrder.orderNumber}
                                </h2>
                                <p className="mt-2 text-xs text-slate-500">
                                    {formatDate(selectedOrder.placedAt)}
                                </p>
                            </div>

                            <button
                                onClick={closeDrawer}
                                className="rounded-xl border border-slate-200 p-3 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <DetailSection title="Dealer Information">
                                <p className="font-bold text-slate-900">
                                    {selectedOrder.dealer?.dealerName || "N/A"}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    {selectedOrder.dealer?.contactPerson || ""}
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-slate-400">Salesman</p>
                                        <p className="mt-1 font-semibold">
                                            {getName(
                                                selectedOrder.salesman ||
                                                selectedOrder.dealer?.salesman
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Team Leader</p>
                                        <p className="mt-1 font-semibold">
                                            {getName(selectedOrder.dealer?.teamLeader)}
                                        </p>
                                    </div>
                                </div>
                            </DetailSection>

                            <DetailSection title="Products">
                                <div className="divide-y divide-slate-100">
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <div
                                            key={`${item.product}-${index}`}
                                            className="flex items-start justify-between gap-4 py-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {item.sku} · Qty {item.quantity}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    ₹{formatPrice(item.unitPrice)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="whitespace-nowrap text-sm font-black">
                                                ₹{formatPrice(item.lineTotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex justify-between border-t border-slate-100 pt-4 font-black">
                                    <span>Grand Total</span>
                                    <span>
                                        ₹{formatPrice(selectedOrder.pricing?.grandTotal)}
                                    </span>
                                </div>
                            </DetailSection>

                            <DetailSection title="Delivery Address">
                                <div className="flex items-start gap-2">
                                    <MapPin
                                        size={17}
                                        className="mt-0.5 shrink-0 text-orange-500"
                                    />
                                    <p className="text-sm leading-6 text-slate-600">
                                        {[
                                            selectedOrder.deliveryAddress?.addressLine1,
                                            selectedOrder.deliveryAddress?.addressLine2,
                                            selectedOrder.deliveryAddress?.area,
                                            selectedOrder.deliveryAddress?.city,
                                            selectedOrder.deliveryAddress?.district,
                                            selectedOrder.deliveryAddress?.state,
                                            selectedOrder.deliveryAddress?.pincode,
                                        ].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </DetailSection>

                            <DetailSection title="Approval History">
                                {selectedOrder.approval?.history?.length ? (
                                    <div className="space-y-4">
                                        {selectedOrder.approval.history.map((entry, index) => (
                                            <div
                                                key={index}
                                                className="border-l-2 border-orange-200 pl-4"
                                            >
                                                <p className="text-sm font-bold text-slate-800">
                                                    {entry.actorName || entry.actorType}
                                                    {" — "}
                                                    {entry.action}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {formatDate(entry.actedAt)}
                                                </p>
                                                {!!entry.remark && (
                                                    <p className="mt-2 text-xs text-slate-600">
                                                        {entry.remark}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">
                                        No approval actions yet.
                                    </p>
                                )}
                            </DetailSection>

                            {/* APPROVAL ACTION */}
                            <DetailSection title="Approval Decision">
                                <p className="mb-4 text-xs text-slate-500">
                                    Choose whether to approve or reject this order.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setAction("approved")}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${action === "approved"
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-slate-200 text-slate-600"
                                            }`}
                                    >
                                        <CheckCircle2 size={17} />
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => setAction("rejected")}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${action === "rejected"
                                                ? "border-red-500 bg-red-50 text-red-700"
                                                : "border-slate-200 text-slate-600"
                                            }`}
                                    >
                                        <XCircle size={17} />
                                        Reject
                                    </button>
                                </div>

                                {action && (
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                                                HO Employee ID
                                            </label>
                                            <input
                                                value={actorId}
                                                onChange={e => setActorId(e.target.value)}
                                                placeholder="Enter employee ObjectId"
                                                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-500"
                                            />
                                        </div>

                                        <textarea
                                            value={remark}
                                            onChange={e => setRemark(e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            placeholder={
                                                action === "rejected"
                                                    ? "Rejection reason (required)"
                                                    : "Approval remark (optional)"
                                            }
                                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-500"
                                        />

                                        <button
                                            disabled={submitting}
                                            onClick={submitDecision}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white disabled:opacity-50"
                                        >
                                            {submitting && (
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            )}
                                            Confirm {action === "approved" ? "Approval" : "Rejection"}
                                        </button>
                                    </div>
                                )}
                            </DetailSection>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
