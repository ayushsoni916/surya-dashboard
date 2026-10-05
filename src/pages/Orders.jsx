// src/pages/Orders.jsx

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
    ShoppingCart,
    Package,
    IndianRupee,
    Clock3,
    CheckCircle2,
    XCircle,
    ChevronRight,
    X,
    MapPin,
    UserRound,
    Phone,
    CalendarDays,
    RotateCcw,
    FileText,
} from "lucide-react";

import {
    API_BASE,
} from "../config/api";


/* ======================================================
   HELPERS
====================================================== */

const formatPrice = value => {
    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    );
};


const formatDate = value => {
    if (!value) {
        return "N/A";
    }

    return new Date(
        value
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatDateTime = value => {
    if (!value) {
        return "N/A";
    }

    return new Date(
        value
    ).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const getDealerName = order => {
    const dealer =
        order?.dealer;

    if (!dealer) {
        return "Unknown Dealer";
    }

    if (
        typeof dealer ===
        "string"
    ) {
        return dealer;
    }

    return (
        dealer.dealerName ||
        dealer.contactPerson ||
        dealer.proprietorNames ||
        "Dealer"
    );
};


const getDealerContact =
    order => {
        const dealer =
            order?.dealer;

        if (
            !dealer ||
            typeof dealer ===
            "string"
        ) {
            return "";
        }

        return (
            dealer.contactPerson ||
            dealer.proprietorNames ||
            ""
        );
    };


const getTotalQuantity =
    order => {
        return (
            order?.items?.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity ||
                        0
                    ),
                0
            ) || 0
        );
    };


/* ======================================================
   STATUS
====================================================== */

const OrderStatus = ({
    status,
}) => {
    const normalized =
        String(
            status || "placed"
        ).toLowerCase();


    const styles = {
        placed:
            "bg-orange-50 text-orange-600 border-orange-100",

        confirmed:
            "bg-amber-50 text-amber-700 border-amber-100",

        processing:
            "bg-blue-50 text-blue-700 border-blue-100",

        dispatched:
            "bg-violet-50 text-violet-700 border-violet-100",

        delivered:
            "bg-emerald-50 text-emerald-700 border-emerald-100",

        cancelled:
            "bg-red-50 text-red-600 border-red-100",
    };


    return (
        <span
            className={`
                inline-flex items-center
                px-2.5 py-1
                rounded-lg
                border
                text-[9px]
                font-black
                uppercase
                tracking-wider

                ${styles[
                normalized
                ] ||
                styles.placed
                }
            `}
        >
            {normalized}
        </span>
    );
};


/* ======================================================
   PAGE
====================================================== */

export default function OrdersPage() {
    const [
        orders,
        setOrders,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        status,
        setStatus,
    ] = useState("");


    const [
        selectedOrder,
        setSelectedOrder,
    ] = useState(null);


    /* ==================================================
       LOAD
    ================================================== */

    const loadOrders =
        useCallback(
            async () => {
                try {
                    setLoading(true);

                    setError("");


                    const response =
                        await fetch(
                            `${API_BASE}/orders`
                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            result.message ||
                            "Unable to load orders"
                        );
                    }


                    setOrders(
                        result.data ||
                        []
                    );

                } catch (error) {
                    console.error(
                        "ORDER LOAD ERROR:",
                        error
                    );

                    setError(
                        error.message
                    );

                } finally {
                    setLoading(false);
                }
            },
            []
        );


    useEffect(() => {
        loadOrders();
    }, [
        loadOrders,
    ]);


    /* ==================================================
       FILTER + SEARCH
    ================================================== */

    const filteredOrders =
        useMemo(() => {
            let result = [
                ...orders,
            ];


            if (status) {
                result =
                    result.filter(
                        order =>
                            order.status ===
                            status
                    );
            }


            const query =
                search
                    .trim()
                    .toLowerCase();


            if (query) {
                result =
                    result.filter(
                        order => {
                            const dealerName =
                                getDealerName(
                                    order
                                );

                            const dealerContact =
                                getDealerContact(
                                    order
                                );


                            const searchableItems =
                                order?.items
                                    ?.map(
                                        item =>
                                            `${item.title || ""} ${item.sku || ""}`
                                    )
                                    .join(
                                        " "
                                    ) ||
                                "";


                            const address =
                                order
                                    ?.deliveryAddress ||
                                {};


                            const searchable =
                                [
                                    order.orderNumber,

                                    dealerName,

                                    dealerContact,

                                    address.contactName,

                                    address.phone,

                                    address.city,

                                    address.district,

                                    address.state,

                                    address.pincode,

                                    searchableItems,
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        " "
                                    )
                                    .toLowerCase();


                            return searchable.includes(
                                query
                            );
                        }
                    );
            }


            return result;
        }, [
            orders,
            status,
            search,
        ]);


    /* ==================================================
       STATS
    ================================================== */

    const stats =
        useMemo(() => {
            return {
                total:
                    orders.length,

                placed:
                    orders.filter(
                        order =>
                            order.status ===
                            "placed"
                    ).length,

                processing:
                    orders.filter(
                        order =>
                            [
                                "confirmed",
                                "processing",
                                "dispatched",
                            ].includes(
                                order.status
                            )
                    ).length,

                delivered:
                    orders.filter(
                        order =>
                            order.status ===
                            "delivered"
                    ).length,

                revenue:
                    orders
                        .filter(
                            order =>
                                order.status !==
                                "cancelled"
                        )
                        .reduce(
                            (
                                total,
                                order
                            ) =>
                                total +
                                Number(
                                    order
                                        ?.pricing
                                        ?.grandTotal ||
                                    0
                                ),
                            0
                        ),
            };
        }, [
            orders,
        ]);


    return (
        <div className="min-h-screen">
            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Orders
                    </h1>

                    <p className="text-xs text-slate-500 mt-1">
                        View and manage dealer orders
                    </p>
                </div>


                <button
                    onClick={
                        loadOrders
                    }
                    className="
                        w-10 h-10
                        rounded-xl
                        border border-slate-200
                        bg-white
                        flex items-center justify-center
                        text-slate-500
                        hover:bg-slate-50
                    "
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


            {/* ==================================================
                CONTENT
            ================================================== */}

            <main className="p-8 max-w-[1700px] mx-auto space-y-6">
                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <StatCard
                        label="Total Orders"
                        value={
                            stats.total
                        }
                        icon={
                            ShoppingCart
                        }
                    />

                    <StatCard
                        label="Placed"
                        value={
                            stats.placed
                        }
                        icon={
                            Clock3
                        }
                    />

                    <StatCard
                        label="In Progress"
                        value={
                            stats.processing
                        }
                        icon={
                            Package
                        }
                    />

                    <StatCard
                        label="Delivered"
                        value={
                            stats.delivered
                        }
                        icon={
                            CheckCircle2
                        }
                    />

                    <StatCard
                        label="Order Value"
                        value={`₹${formatPrice(
                            stats.revenue
                        )}`}
                        icon={
                            IndianRupee
                        }
                    />
                </div>


                {/* ==================================================
                    TABLE CARD
                ================================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* FILTER BAR */}

                    <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={
                                    event =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                }
                                placeholder="Search order, dealer, product, city, phone or pincode..."
                                className="
                                    w-full
                                    pl-11 pr-4
                                    py-3
                                    rounded-xl
                                    bg-slate-50
                                    border border-slate-200
                                    text-sm
                                    font-semibold
                                    outline-none

                                    focus:bg-white
                                    focus:border-orange-500
                                    focus:ring-4
                                    focus:ring-orange-500/10
                                "
                            />
                        </div>


                        <select
                            value={
                                status
                            }
                            onChange={
                                event =>
                                    setStatus(
                                        event
                                            .target
                                            .value
                                    )
                            }
                            className="
                                min-w-[190px]
                                px-4 py-3
                                rounded-xl
                                border border-slate-200
                                bg-slate-50
                                text-sm
                                font-semibold
                                outline-none
                            "
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="placed">
                                Placed
                            </option>

                            <option value="confirmed">
                                Confirmed
                            </option>

                            <option value="processing">
                                Processing
                            </option>

                            <option value="dispatched">
                                Dispatched
                            </option>

                            <option value="delivered">
                                Delivered
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>
                        </select>
                    </div>


                    {/* RESULT INFO */}

                    {!loading &&
                        !error ? (
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <p className="text-[11px] text-slate-500 font-semibold">
                                Showing{" "}
                                <span className="text-slate-900 font-bold">
                                    {
                                        filteredOrders.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="text-slate-900 font-bold">
                                    {
                                        orders.length
                                    }
                                </span>{" "}
                                orders
                            </p>


                            {(search ||
                                status) && (
                                    <button
                                        onClick={() => {
                                            setSearch(
                                                ""
                                            );

                                            setStatus(
                                                ""
                                            );
                                        }}
                                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                        </div>
                    ) : null}


                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    {error ? (
                        <div className="py-24 text-center">
                            <XCircle
                                size={40}
                                className="mx-auto text-red-400"
                            />

                            <p className="font-bold text-slate-800 mt-3">
                                Unable to load orders
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                {error}
                            </p>
                        </div>

                    ) : loading ? (
                        <div className="py-28 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">
                                Loading Orders
                            </p>
                        </div>

                    ) : filteredOrders.length ===
                        0 ? (
                        <div className="py-24 text-center">
                            <ShoppingCart
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <p className="font-semibold text-slate-700 mt-3">
                                No orders found
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                Try changing your search or filters.
                            </p>
                        </div>

                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <TH>
                                            Order
                                        </TH>

                                        <TH>
                                            Dealer
                                        </TH>

                                        <TH>
                                            Items
                                        </TH>

                                        <TH>
                                            Delivery
                                        </TH>

                                        <TH>
                                            Amount
                                        </TH>

                                        <TH>
                                            Placed
                                        </TH>

                                        <TH>
                                            Status
                                        </TH>

                                        <TH />
                                    </tr>
                                </thead>


                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map(
                                        order => (
                                            <tr
                                                key={
                                                    order._id
                                                }
                                                onClick={() =>
                                                    setSelectedOrder(
                                                        order
                                                    )
                                                }
                                                className="
                                                    hover:bg-slate-50
                                                    cursor-pointer
                                                    transition
                                                "
                                            >
                                                {/* ORDER */}

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                                            {
                                                                order.orderNumber
                                                            }
                                                        </p>

                                                        {order.repeatedFrom && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <RotateCcw
                                                                    size={
                                                                        10
                                                                    }
                                                                    className="text-orange-500"
                                                                />

                                                                <span className="text-[9px] font-bold text-orange-500 uppercase">
                                                                    Repeated
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>


                                                {/* DEALER */}

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {getDealerName(
                                                                order
                                                            )}
                                                        </p>

                                                        {getDealerContact(
                                                            order
                                                        ) && (
                                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                                    {getDealerContact(
                                                                        order
                                                                    )}
                                                                </p>
                                                            )}
                                                    </div>
                                                </td>


                                                {/* ITEMS */}

                                                <TD>
                                                    <div>
                                                        <p className="font-bold text-slate-800">
                                                            {getTotalQuantity(
                                                                order
                                                            )}
                                                        </p>

                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            {order
                                                                ?.items
                                                                ?.length ||
                                                                0}{" "}
                                                            products
                                                        </p>
                                                    </div>
                                                </TD>


                                                {/* DELIVERY */}

                                                <TD>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin
                                                            size={
                                                                13
                                                            }
                                                            className="text-slate-400 shrink-0"
                                                        />

                                                        <div>
                                                            <p className="font-semibold text-slate-700">
                                                                {order
                                                                    ?.deliveryAddress
                                                                    ?.city ||
                                                                    "N/A"}
                                                            </p>

                                                            {order
                                                                ?.deliveryAddress
                                                                ?.pincode && (
                                                                    <p className="text-[10px] text-slate-400">
                                                                        {
                                                                            order
                                                                                .deliveryAddress
                                                                                .pincode
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                </TD>


                                                {/* AMOUNT */}

                                                <TD>
                                                    <p className="font-black text-slate-900 whitespace-nowrap">
                                                        ₹
                                                        {formatPrice(
                                                            order
                                                                ?.pricing
                                                                ?.grandTotal
                                                        )}
                                                    </p>
                                                </TD>


                                                {/* DATE */}

                                                <TD>
                                                    {formatDate(
                                                        order.placedAt ||
                                                        order.createdAt
                                                    )}
                                                </TD>


                                                {/* STATUS */}

                                                <TD>
                                                    <OrderStatus
                                                        status={
                                                            order.status
                                                        }
                                                    />
                                                </TD>


                                                {/* OPEN */}

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


            {/* ==================================================
                DRAWER
            ================================================== */}

            {selectedOrder && (
                <OrderDrawer
                    order={
                        selectedOrder
                    }

                    onClose={() =>
                        setSelectedOrder(
                            null
                        )
                    }

                    onUpdated={
                        updatedOrder => {
                            setOrders(
                                previous =>
                                    previous.map(
                                        item =>
                                            item._id ===
                                                updatedOrder._id
                                                ? updatedOrder
                                                : item
                                    )
                            );

                            setSelectedOrder(
                                updatedOrder
                            );
                        }
                    }
                />
            )}
        </div>
    );
}


/* ======================================================
   ORDER DRAWER
====================================================== */

const OrderDrawer = ({
    order,
    onClose,
    onUpdated
}) => {
    const address =
        order?.deliveryAddress ||
        {};

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState(
        order.status ||
        "placed"
    );

    const [
        updatingStatus,
        setUpdatingStatus,
    ] = useState(false);

    const [
        statusUpdated,
        setStatusUpdated,
    ] = useState(false);

    useEffect(() => {
        setSelectedStatus(
            order.status ||
            "placed"
        );
    }, [
        order,
    ]);

    const handleStatusUpdate =
        async () => {
            if (
                selectedStatus ===
                order.status
            ) {
                return;
            }


            try {
                setUpdatingStatus(
                    true
                );

                setStatusUpdated(
                    false
                );


                const response =
                    await fetch(
                        `${API_BASE}/orders/${order._id}/status`,
                        {
                            method:
                                "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    status:
                                        selectedStatus,
                                }),
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Unable to update order status"
                    );
                }


                onUpdated(
                    result.data
                );


                setStatusUpdated(
                    true
                );


                setTimeout(
                    () =>
                        setStatusUpdated(
                            false
                        ),
                    2000
                );

            } catch (error) {
                console.error(
                    "UPDATE STATUS ERROR:",
                    error
                );

                alert(
                    error.message
                );

            } finally {
                setUpdatingStatus(
                    false
                );
            }
        };


    return (
        <div
            className="
                fixed inset-0
                z-[100]
                bg-slate-950/30
                backdrop-blur-[2px]
                flex justify-end
            "
            onMouseDown={
                event => {
                    if (
                        event.target ===
                        event.currentTarget
                    ) {
                        onClose();
                    }
                }
            }
        >
            <div
                className="
                    w-full
                    max-w-[580px]
                    h-full
                    bg-[#F8F9FB]
                    shadow-2xl
                    flex flex-col
                    animate-in
                    slide-in-from-right
                    duration-300
                "
            >
                {/* HEADER */}

                <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400">
                                Order Details
                            </p>

                            <OrderStatus
                                status={
                                    order.status
                                }
                            />
                        </div>


                        <h2 className="text-xl font-bold text-slate-900 mt-2">
                            {
                                order.orderNumber
                            }
                        </h2>


                        <p className="text-xs text-slate-400 mt-1">
                            Placed{" "}
                            {formatDateTime(
                                order.placedAt ||
                                order.createdAt
                            )}
                        </p>
                    </div>


                    <button
                        onClick={
                            onClose
                        }
                        className="
                            w-10 h-10
                            rounded-xl
                            border border-slate-200
                            flex items-center justify-center
                            text-slate-400
                            hover:text-slate-900
                            hover:bg-slate-50
                        "
                    >
                        <X
                            size={
                                18
                            }
                        />
                    </button>
                </div>


                {/* CONTENT */}

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* QUICK SUMMARY */}

                    <div className="grid grid-cols-3 gap-3">
                        <MiniCard
                            label="Items"
                            value={
                                getTotalQuantity(
                                    order
                                )
                            }
                        />

                        <MiniCard
                            label="Products"
                            value={
                                order
                                    ?.items
                                    ?.length ||
                                0
                            }
                        />

                        <MiniCard
                            label="Order Total"
                            value={`₹${formatPrice(
                                order
                                    ?.pricing
                                    ?.grandTotal
                            )}`}
                        />
                    </div>

                    {/* STATUS MANAGEMENT */}

                    <DetailSection
                        title="Order Status"
                        icon={
                            Clock3
                        }
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                                    Current Status
                                </label>

                                <div className="mt-2">
                                    <OrderStatus
                                        status={
                                            order.status
                                        }
                                    />
                                </div>
                            </div>


                            <div className="grid grid-cols-[1fr_auto] gap-3">
                                <select
                                    value={
                                        selectedStatus
                                    }
                                    onChange={
                                        event => {
                                            setSelectedStatus(
                                                event.target.value
                                            );

                                            setStatusUpdated(
                                                false
                                            );
                                        }
                                    }
                                    className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    text-sm
                    font-semibold
                    text-slate-800
                    outline-none

                    focus:bg-white
                    focus:border-orange-500
                    focus:ring-4
                    focus:ring-orange-500/10
                "
                                >
                                    <option value="placed">
                                        Placed
                                    </option>

                                    <option value="confirmed">
                                        Confirmed
                                    </option>

                                    <option value="processing">
                                        Processing
                                    </option>

                                    <option value="dispatched">
                                        Dispatched
                                    </option>

                                    <option value="delivered">
                                        Delivered
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>
                                </select>


                                <button
                                    onClick={
                                        handleStatusUpdate
                                    }

                                    disabled={
                                        updatingStatus ||
                                        selectedStatus ===
                                        order.status
                                    }

                                    className="
                    min-w-[125px]
                    px-5
                    rounded-xl
                    bg-slate-900
                    text-white
                    text-xs
                    font-bold

                    hover:bg-slate-800

                    disabled:opacity-40
                    disabled:cursor-not-allowed

                    transition
                "
                                >
                                    {updatingStatus ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />

                                            Updating
                                        </span>
                                    ) : (
                                        "Update Status"
                                    )}
                                </button>
                            </div>


                            {statusUpdated && (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle2
                                        size={14}
                                    />

                                    <span className="text-xs font-bold">
                                        Status updated successfully
                                    </span>
                                </div>
                            )}
                        </div>
                    </DetailSection>


                    {/* DEALER */}

                    <DetailSection
                        title="Dealer"
                        icon={
                            UserRound
                        }
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Dealer Name"
                                value={
                                    getDealerName(
                                        order
                                    )
                                }
                            />

                            <DetailItem
                                label="Contact Person"
                                value={
                                    getDealerContact(
                                        order
                                    ) ||
                                    "N/A"
                                }
                            />
                        </DetailGrid>
                    </DetailSection>


                    {/* PRODUCTS */}

                    <DetailSection
                        title="Products"
                        icon={
                            Package
                        }
                    >
                        <div className="divide-y divide-slate-100">
                            {order
                                ?.items
                                ?.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            key={`${item.product}-${index}`}
                                            className="py-4 first:pt-0 last:pb-0 flex gap-4"
                                        >
                                            <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={
                                                            item.image
                                                        }
                                                        alt=""
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={
                                                            20
                                                        }
                                                        className="text-slate-300"
                                                    />
                                                )}
                                            </div>


                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 leading-snug">
                                                    {
                                                        item.title
                                                    }
                                                </p>

                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-400">
                                                        SKU:{" "}
                                                        {item.sku ||
                                                            "N/A"}
                                                    </span>

                                                    <span className="text-[10px] text-slate-400">
                                                        Qty:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </span>
                                                </div>


                                                <p className="text-xs text-slate-500 mt-2">
                                                    ₹
                                                    {formatPrice(
                                                        item.unitPrice
                                                    )}{" "}
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </p>
                                            </div>


                                            <p className="text-sm font-black text-slate-900 whitespace-nowrap">
                                                ₹
                                                {formatPrice(
                                                    item.lineTotal
                                                )}
                                            </p>
                                        </div>
                                    )
                                )}
                        </div>
                    </DetailSection>


                    {/* PRICING */}

                    <DetailSection
                        title="Pricing"
                        icon={
                            IndianRupee
                        }
                    >
                        <div className="space-y-3">
                            <PriceRow
                                label="Total MRP"
                                value={
                                    order
                                        ?.pricing
                                        ?.totalMrp
                                }
                            />

                            <PriceRow
                                label="Dealer Discount"
                                value={
                                    order
                                        ?.pricing
                                        ?.discount
                                }
                                minus
                            />

                            <PriceRow
                                label="Subtotal"
                                value={
                                    order
                                        ?.pricing
                                        ?.subtotal
                                }
                            />

                            <PriceRow
                                label="Delivery"
                                customValue={
                                    order
                                        ?.pricing
                                        ?.deliveryChargeConfirmed
                                        ? `₹${formatPrice(
                                            order
                                                ?.pricing
                                                ?.deliveryCharge
                                        )}`
                                        : "To be confirmed"
                                }
                            />

                            <div className="border-t border-slate-100 pt-3">
                                <PriceRow
                                    label="Grand Total"
                                    value={
                                        order
                                            ?.pricing
                                            ?.grandTotal
                                    }
                                    strong
                                />
                            </div>
                        </div>
                    </DetailSection>


                    {/* ADDRESS */}

                    <DetailSection
                        title="Delivery Address"
                        icon={
                            MapPin
                        }
                    >
                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-bold text-sm text-slate-900">
                                    {address.contactName ||
                                        "N/A"}
                                </p>

                                {address.label && (
                                    <span className="text-[9px] uppercase font-black tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                        {
                                            address.label
                                        }
                                    </span>
                                )}
                            </div>


                            <p className="text-sm text-slate-600 leading-6 mt-3">
                                {[
                                    address.addressLine1,

                                    address.addressLine2,

                                    address.area,

                                    address.city,

                                    address.district,

                                    address.state,

                                    address.pincode,

                                    address.country,
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        ", "
                                    )}
                            </p>


                            {address.phone && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                                    <Phone
                                        size={
                                            14
                                        }
                                    />

                                    {
                                        address.phone
                                    }
                                </div>
                            )}
                        </div>
                    </DetailSection>


                    {/* NOTE */}

                    {order.note && (
                        <DetailSection
                            title="Order Note"
                            icon={
                                FileText
                            }
                        >
                            <p className="text-sm text-slate-600 leading-6">
                                {
                                    order.note
                                }
                            </p>
                        </DetailSection>
                    )}


                    {/* REPEAT INFO */}

                    {order.repeatedFrom && (
                        <DetailSection
                            title="Repeat Order"
                            icon={
                                RotateCcw
                            }
                        >
                            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                                <p className="text-xs font-semibold text-orange-700">
                                    This order was created by repeating a previous order.
                                </p>

                                <p className="text-[10px] text-orange-500 mt-1 break-all">
                                    Original Order ID:{" "}
                                    {String(
                                        order.repeatedFrom
                                    )}
                                </p>
                            </div>
                        </DetailSection>
                    )}


                    {/* META */}

                    <DetailSection
                        title="Timeline"
                        icon={
                            CalendarDays
                        }
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Placed At"
                                value={
                                    formatDateTime(
                                        order.placedAt
                                    )
                                }
                            />

                            <DetailItem
                                label="Last Updated"
                                value={
                                    formatDateTime(
                                        order.updatedAt
                                    )
                                }
                            />
                        </DetailGrid>
                    </DetailSection>
                </div>
            </div>
        </div>
    );
};


/* ======================================================
   STAT
====================================================== */

const StatCard = ({
    label,
    value,
    icon: Icon,
}) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    {label}
                </p>

                <p className="text-2xl font-black text-slate-900 mt-2">
                    {value}
                </p>
            </div>


            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Icon
                    size={
                        18
                    }
                />
            </div>
        </div>
    );
};


/* ======================================================
   TABLE HELPERS
====================================================== */

const TH = ({
    children,
}) => (
    <th className="px-6 py-3.5 text-[10px] uppercase tracking-widest font-black text-slate-400 whitespace-nowrap">
        {children}
    </th>
);


const TD = ({
    children,
}) => (
    <td className="px-6 py-4 text-sm text-slate-600">
        {children}
    </td>
);


/* ======================================================
   DETAIL HELPERS
====================================================== */

const DetailSection = ({
    title,
    icon: Icon,
    children,
}) => (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Icon
                size={
                    15
                }
                className="text-orange-500"
            />

            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                {title}
            </p>
        </div>

        <div className="p-5">
            {children}
        </div>
    </section>
);


const DetailGrid = ({
    children,
}) => (
    <div className="grid grid-cols-2 gap-4">
        {children}
    </div>
);


const DetailItem = ({
    label,
    value,
}) => (
    <div>
        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
            {label}
        </p>

        <p className="text-sm font-bold text-slate-800 mt-1">
            {value || "N/A"}
        </p>
    </div>
);


const MiniCard = ({
    label,
    value,
}) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
            {label}
        </p>

        <p className="text-sm font-black text-slate-900 mt-2">
            {value}
        </p>
    </div>
);


const PriceRow = ({
    label,
    value,
    customValue,
    minus = false,
    strong = false,
}) => (
    <div className="flex items-center justify-between gap-4">
        <span
            className={
                strong
                    ? "text-sm font-black text-slate-900"
                    : "text-sm text-slate-500"
            }
        >
            {label}
        </span>

        <span
            className={
                strong
                    ? "text-base font-black text-slate-900"
                    : minus
                        ? "text-sm font-bold text-emerald-600"
                        : "text-sm font-bold text-slate-900"
            }
        >
            {customValue !==
                undefined
                ? customValue
                : `${minus &&
                    Number(
                        value ||
                        0
                    ) >
                    0
                    ? "- "
                    : ""
                }₹${formatPrice(
                    value
                )}`}
        </span>
    </div>
);