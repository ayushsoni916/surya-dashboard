import React, { useState } from "react";

import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Wallet,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    ClipboardList,
    Bell,
    Gift,
    Store,
    ShieldCheck,
    Warehouse,
    UserRoundCheck,
    QrCode
} from "lucide-react";

import {
    NavLink,
    Outlet,
} from "react-router-dom";

const MENU = [
    {
        name: "Overview",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Products",
        path: "/products",
        icon: Package,
    },
    {
        name: "Users",
        path: "/users",
        icon: Users,
    },
    {
        name: "Dealer Requests",
        path: "/dealer-requests",
        icon: ClipboardList,
    },
    {
        name: "Orders",
        path: "/orders",
        icon: ShoppingCart,
    },
    {
        name: "Team Leader Approvals",
        path: "/team-leader-approvals",
        icon: UserRoundCheck,
    },
    {
        name: "Admin Approvals",
        path: "/admin-approvals",
        icon: ShieldCheck,
    },
    {
        name: "Warehouse Approvals",
        path: "/warehouse-approvals",
        icon: Warehouse,
    },
    {
        name: "Gift Management",
        path: "/gifts",
        icon: Gift,
    },
    {
        name: "Dealer QR Codes",
        path: "/dealer-qr-codes",
        icon: QrCode,
    },
    {
        name: "Dealer Gift Inventory",
        path: "/dealer-gifts",
        icon: Store,
    },
    {
        name: 'Notifications',
        path: '/notifications',
        icon: Bell
    },
    { name: "Reward Orders", path: "/scratch-orders", icon: Gift },
    {
        name: "Payments",
        path: "/payments",
        icon: Wallet,
        disabled: true,
    },


];

export default function DashboardLayout() {
    const [collapsed, setCollapsed] =
        useState(false);

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex">
            {/* ======================================================
          SIDEBAR
      ====================================================== */}

            <aside
                className={`
          fixed top-0 left-0 z-50 h-screen
          bg-[#111827]
          border-r border-white/5
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed
                        ? "w-[78px]"
                        : "w-[240px]"
                    }
        `}
            >
                {/* TOP */}

                <div
                    className={`
            h-[72px]
            flex items-center
            border-b border-white/10
            ${collapsed
                            ? "justify-center px-3"
                            : "justify-between px-4"
                        }
          `}
                >
                    {!collapsed && (
                        <div>
                            <h1 className="text-white font-semibold text-sm">
                                Admin Panel
                            </h1>

                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Management Console
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() =>
                            setCollapsed(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="
              w-9 h-9
              rounded-lg
              flex items-center justify-center
              text-slate-400
              hover:text-white
              hover:bg-white/10
              transition
            "
                    >
                        {collapsed ? (
                            <PanelLeftOpen
                                size={18}
                            />
                        ) : (
                            <PanelLeftClose
                                size={18}
                            />
                        )}
                    </button>
                </div>

                {/* NAVIGATION */}

                <nav className="flex-1 py-5 px-3 overflow-y-auto">
                    {!collapsed && (
                        <p className="px-3 mb-3 text-[9px] uppercase tracking-[0.18em] font-bold text-slate-600">
                            Navigation
                        </p>
                    )}

                    <div className="space-y-1">
                        {MENU.map((item) => {
                            const Icon =
                                item.icon;

                            if (item.disabled) {
                                return (
                                    <div
                                        key={item.name}
                                        title={
                                            collapsed
                                                ? item.name
                                                : undefined
                                        }
                                        className={`
                      h-11
                      rounded-xl
                      flex items-center
                      text-slate-600
                      cursor-not-allowed
                      ${collapsed
                                                ? "justify-center"
                                                : "px-3"
                                            }
                    `}
                                    >
                                        <Icon
                                            size={18}
                                            className="shrink-0"
                                        />

                                        {!collapsed && (
                                            <>
                                                <span className="ml-3 text-sm font-medium">
                                                    {item.name}
                                                </span>

                                                <span className="ml-auto text-[8px] px-2 py-1 rounded-md bg-white/5 uppercase font-bold">
                                                    Soon
                                                </span>
                                            </>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={
                                        item.path === "/"
                                    }
                                    title={
                                        collapsed
                                            ? item.name
                                            : undefined
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        `
                      h-11
                      rounded-xl
                      flex items-center
                      transition-all
                      ${collapsed
                                            ? "justify-center"
                                            : "px-3"
                                        }
                      ${isActive
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                                        }
                    `
                                    }
                                >
                                    <Icon
                                        size={18}
                                        className="shrink-0"
                                    />

                                    {!collapsed && (
                                        <>
                                            <span className="ml-3 text-sm font-medium">
                                                {item.name}
                                            </span>

                                            <ChevronRight
                                                size={14}
                                                className="ml-auto opacity-40"
                                            />
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* BOTTOM */}

                <div className="border-t border-white/10 p-3 space-y-1">
                    <button
                        title={
                            collapsed
                                ? "Settings"
                                : undefined
                        }
                        className={`
              w-full h-11 rounded-xl
              flex items-center
              text-slate-400
              hover:bg-white/10
              hover:text-white
              transition
              ${collapsed
                                ? "justify-center"
                                : "px-3"
                            }
            `}
                    >
                        <Settings
                            size={18}
                        />

                        {!collapsed && (
                            <span className="ml-3 text-sm font-medium">
                                Settings
                            </span>
                        )}
                    </button>

                    <button
                        title={
                            collapsed
                                ? "Logout"
                                : undefined
                        }
                        className={`
              w-full h-11 rounded-xl
              flex items-center
              text-slate-400
              hover:bg-red-500/10
              hover:text-red-400
              transition
              ${collapsed
                                ? "justify-center"
                                : "px-3"
                            }
            `}
                    >
                        <LogOut size={18} />

                        {!collapsed && (
                            <span className="ml-3 text-sm font-medium">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ======================================================
          CONTENT
      ====================================================== */}

            <main
                className={`
          min-h-screen flex-1
          transition-all duration-300
          ${collapsed
                        ? "ml-[78px]"
                        : "ml-[240px]"
                    }
        `}
            >
                <Outlet />
            </main>
        </div>
    );
}