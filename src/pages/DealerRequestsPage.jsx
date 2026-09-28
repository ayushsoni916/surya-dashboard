import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Loader2,
    Users,
    Clock3,
    CheckCircle2,
    XCircle,
    ChevronRight,
    X,
    Phone,
    Building2,
    MapPin,
    Hash,
    CalendarDays,
} from "lucide-react";

import { API_BASE } from "../config/api";

export default function DealerRequestsPage() {
    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    /* ======================================================
       LOAD REQUESTS
    ====================================================== */

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            if (status) {
                params.set(
                    "status",
                    status
                );
            }

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                );
            }

            const query =
                params.toString();

            const response =
                await fetch(
                    `${API_BASE}/dealer-requests${query
                        ? `?${query}`
                        : ""
                    }`
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to load dealer requests"
                );
            }

            setRequests(
                result.data || []
            );
        } catch (error) {
            console.error(
                error
            );

            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    }, [status, search]);

    /* ======================================================
       SEARCH DEBOUNCE
    ====================================================== */

    useEffect(() => {
        const timer =
            setTimeout(() => {
                loadRequests();
            }, 400);

        return () =>
            clearTimeout(timer);
    }, [loadRequests]);

    /* ======================================================
       COUNTS
    ====================================================== */

    const stats = useMemo(() => {
        return {
            total: requests.length,

            pending:
                requests.filter(
                    item =>
                        item.status ===
                        "pending"
                ).length,

            approved:
                requests.filter(
                    item =>
                        item.status ===
                        "approved"
                ).length,

            rejected:
                requests.filter(
                    item =>
                        item.status ===
                        "rejected"
                ).length,
        };
    }, [requests]);

    return (
        <div className="min-h-screen">
            {/* HEADER */}

            <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Dealer Requests
                    </h1>

                    <p className="text-xs text-slate-500 mt-1">
                        Review applications from businesses wanting
                        to become dealers
                    </p>
                </div>

                <button
                    onClick={loadRequests}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />
                </button>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto space-y-6">
                {/* STATS */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Requests"
                        value={stats.total}
                        icon={Users}
                    />

                    <StatCard
                        label="Pending"
                        value={stats.pending}
                        icon={Clock3}
                    />

                    <StatCard
                        label="Approved"
                        value={stats.approved}
                        icon={CheckCircle2}
                    />

                    <StatCard
                        label="Rejected"
                        value={stats.rejected}
                        icon={XCircle}
                    />
                </div>

                {/* TABLE CARD */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* FILTERS */}

                    <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={event =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search name, phone, business, city or pincode..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={event =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none"
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="approved">
                                Approved
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>
                        </select>
                    </div>

                    {/* CONTENT */}

                    {error ? (
                        <div className="py-20 text-center">
                            <XCircle
                                size={38}
                                className="mx-auto text-red-400"
                            />

                            <p className="font-bold text-slate-800 mt-3">
                                Unable to load requests
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                {error}
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="py-24 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">
                                Loading Requests
                            </p>
                        </div>
                    ) : requests.length ===
                        0 ? (
                        <div className="py-20 text-center">
                            <Users
                                size={38}
                                className="mx-auto text-slate-300"
                            />

                            <p className="font-semibold text-slate-700 mt-3">
                                No dealer requests found
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <TH>
                                            Applicant
                                        </TH>

                                        <TH>
                                            Business
                                        </TH>

                                        <TH>
                                            Location
                                        </TH>

                                        <TH>
                                            Phone
                                        </TH>

                                        <TH>
                                            Applied
                                        </TH>

                                        <TH>
                                            Status
                                        </TH>

                                        <TH />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {requests.map(
                                        request => (
                                            <tr
                                                key={
                                                    request._id
                                                }
                                                onClick={() =>
                                                    setSelectedRequest(
                                                        request
                                                    )
                                                }
                                                className="hover:bg-slate-50 cursor-pointer transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                            {request.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-bold text-sm text-slate-900">
                                                                {
                                                                    request.name
                                                                }
                                                            </p>

                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                Dealer
                                                                applicant
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <TD>
                                                    {
                                                        request.businessName
                                                    }
                                                </TD>

                                                <TD>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin
                                                            size={
                                                                13
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        {
                                                            request.city
                                                        }

                                                        {request.pincode
                                                            ? ` - ${request.pincode}`
                                                            : ""}
                                                    </div>
                                                </TD>

                                                <TD>
                                                    {
                                                        request.phone
                                                    }
                                                </TD>

                                                <TD>
                                                    {formatDate(
                                                        request.createdAt
                                                    )}
                                                </TD>

                                                <TD>
                                                    <RequestStatus
                                                        status={
                                                            request.status
                                                        }
                                                    />
                                                </TD>

                                                <td className="px-6 py-4 text-right">
                                                    <ChevronRight
                                                        size={
                                                            16
                                                        }
                                                        className="ml-auto text-slate-400"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {selectedRequest && (
                <DealerRequestDrawer
                    request={
                        selectedRequest
                    }
                    onClose={() =>
                        setSelectedRequest(
                            null
                        )
                    }
                />
            )}
        </div>
    );
}

/* ======================================================
   REQUEST DETAILS DRAWER
====================================================== */

const DealerRequestDrawer = ({
    request,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/30 backdrop-blur-[2px] flex justify-end">
            <div className="w-full max-w-[520px] h-full bg-[#F8F9FB] shadow-2xl flex flex-col">
                {/* HEADER */}

                <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400">
                                Dealer Application
                            </p>

                            <RequestStatus
                                status={
                                    request.status
                                }
                            />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mt-2">
                            {request.name}
                        </h2>

                        <p className="text-xs text-slate-400 mt-1">
                            {request.businessName}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTENT */}

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <DetailSection
                        title="Applicant"
                        icon={Users}
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Full Name"
                                value={
                                    request.name
                                }
                            />

                            <DetailItem
                                label="Phone"
                                value={
                                    request.phone
                                }
                            />
                        </DetailGrid>
                    </DetailSection>

                    <DetailSection
                        title="Business"
                        icon={Building2}
                    >
                        <DetailGrid>
                            <DetailItem
                                wide
                                label="Business Name"
                                value={
                                    request.businessName
                                }
                            />
                        </DetailGrid>
                    </DetailSection>

                    <DetailSection
                        title="Location"
                        icon={MapPin}
                    >
                        <DetailGrid>
                            <DetailItem
                                label="City"
                                value={
                                    request.city
                                }
                            />

                            <DetailItem
                                label="Pincode"
                                value={
                                    request.pincode
                                }
                            />
                        </DetailGrid>
                    </DetailSection>

                    <DetailSection
                        title="Application"
                        icon={CalendarDays}
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Submitted"
                                value={formatDateTime(
                                    request.createdAt
                                )}
                            />

                            <DetailItem
                                label="Source"
                                value={
                                    request.source ===
                                        "dealerApp"
                                        ? "Dealer App"
                                        : request.source
                                }
                            />

                            <DetailItem
                                label="Status"
                                value={
                                    request.status
                                }
                            />

                            <DetailItem
                                label="Last Updated"
                                value={formatDateTime(
                                    request.updatedAt
                                )}
                            />
                        </DetailGrid>
                    </DetailSection>

                    {request.status ===
                        "rejected" &&
                        request.rejectionReason && (
                            <DetailSection
                                title="Rejection"
                                icon={XCircle}
                            >
                                <DetailItem
                                    wide
                                    label="Reason"
                                    value={
                                        request.rejectionReason
                                    }
                                />
                            </DetailSection>
                        )}

                    {request.reviewedBy && (
                        <DetailSection
                            title="Reviewed By"
                            icon={CheckCircle2}
                        >
                            <DetailGrid>
                                <DetailItem
                                    label="Name"
                                    value={
                                        request
                                            .reviewedBy
                                            ?.name
                                    }
                                />

                                <DetailItem
                                    label="Role"
                                    value={
                                        request
                                            .reviewedBy
                                            ?.role
                                    }
                                />
                            </DetailGrid>
                        </DetailSection>
                    )}
                </div>

                {/* FOOTER */}

                <div className="p-4 border-t border-slate-200 bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ======================================================
   SMALL COMPONENTS
====================================================== */

const StatCard = ({
    label,
    value,
    icon: Icon,
}) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Icon size={20} />
        </div>

        <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {label}
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
                {value}
            </p>
        </div>
    </div>
);

const RequestStatus = ({
    status,
}) => {
    const styles = {
        pending:
            "bg-amber-50 text-amber-700",

        approved:
            "bg-emerald-50 text-emerald-700",

        rejected:
            "bg-red-50 text-red-600",
    };

    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold ${styles[status] ||
                "bg-slate-100 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
};

const TH = ({ children }) => (
    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">
        {children}
    </th>
);

const TD = ({ children }) => (
    <td className="px-6 py-4 text-sm font-medium text-slate-600">
        {children || "—"}
    </td>
);

const DetailSection = ({
    title,
    icon: Icon,
    children,
}) => (
    <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Icon
                size={15}
                className="text-slate-400"
            />

            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {title}
            </p>
        </div>

        <div className="p-5">
            {children}
        </div>
    </div>
);

const DetailGrid = ({
    children,
}) => (
    <div className="grid grid-cols-2 gap-5">
        {children}
    </div>
);

const DetailItem = ({
    label,
    value,
    wide,
}) => (
    <div
        className={
            wide
                ? "col-span-2"
                : ""
        }
    >
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            {label}
        </p>

        <p className="text-sm font-semibold text-slate-800 break-words capitalize">
            {value || "—"}
        </p>
    </div>
);

const formatDate = value => {
    if (!value) return "—";

    return new Date(
        value
    ).toLocaleDateString(
        "en-IN"
    );
};

const formatDateTime = value => {
    if (!value) return "—";

    return new Date(
        value
    ).toLocaleString(
        "en-IN"
    );
};