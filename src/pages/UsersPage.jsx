import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Users,
    UserRound,
    Building2,
    Search,
    Plus,
    RefreshCw,
    X,
    Loader2,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    CheckCircle2,
    XCircle,
    CreditCard,
    Landmark,
    MapPinned,
    BriefcaseBusiness,
    UserCheck,
    Hash,
} from "lucide-react";

import { API_BASE } from "../config/api";

const TABS = [
    {
        id: "ho",
        label: "Head Office",
        icon: ShieldCheck,
    },

    {
        id: "salesmen",
        label: "Salesmen",
        icon: UserRound,
    },

    {
        id: "dealers",
        label: "Dealers",
        icon: Building2,
    },
];

export default function UsersPage() {
    const [activeTab, setActiveTab] =
        useState("ho");

    const [hoUsers, setHoUsers] =
        useState([]);

    const [salesmen, setSalesmen] =
        useState([]);

    const [dealers, setDealers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [showCreate, setShowCreate] =
        useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers =
        useCallback(async () => {
            try {
                setLoading(true);

                const [
                    hoResponse,
                    salesmanResponse,
                    dealerResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE}/ho-users`
                    ),

                    fetch(
                        `${API_BASE}/salesmen`
                    ),

                    fetch(
                        `${API_BASE}/dealers`
                    ),
                ]);

                const [
                    hoResult,
                    salesmanResult,
                    dealerResult,
                ] = await Promise.all([
                    hoResponse.json(),
                    salesmanResponse.json(),
                    dealerResponse.json(),
                ]);

                setHoUsers(
                    hoResult.data || []
                );

                setSalesmen(
                    salesmanResult.data || []
                );

                setDealers(
                    dealerResult.data || []
                );
            } catch (error) {
                console.error(
                    "Users load error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const currentData =
        useMemo(() => {
            let data = [];

            if (activeTab === "ho") {
                data = hoUsers;
            }

            if (
                activeTab === "salesmen"
            ) {
                data = salesmen;
            }

            if (
                activeTab === "dealers"
            ) {
                data = dealers;
            }

            if (!search.trim()) {
                return data;
            }

            const value =
                search.toLowerCase();

            return data.filter(
                (item) => {
                    const name =
                        item.name ||
                        item.dealerName ||
                        "";

                    const mobile =
                        item.mobile ||
                        item.contact
                            ?.mobileNumber ||
                        "";

                    const email =
                        item.email ||
                        item.contact?.email ||
                        "";

                    return (
                        name
                            .toLowerCase()
                            .includes(value) ||
                        mobile
                            .toLowerCase()
                            .includes(value) ||
                        email
                            .toLowerCase()
                            .includes(value)
                    );
                }
            );
        }, [
            activeTab,
            hoUsers,
            salesmen,
            dealers,
            search,
        ]);

    return (
        <div className="min-h-screen">
            {/* HEADER */}

            <header className="h-[78px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                        User Management
                    </p>

                    <h1 className="text-xl font-black text-slate-900 mt-1">
                        Users & Network
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={loadUsers}
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

                    <button
                        onClick={() =>
                            setShowCreate(true)
                        }
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg"
                    >
                        <Plus size={17} />

                        Add User
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto space-y-6">
                {/* STATS */}

                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        label="Head Office"
                        value={hoUsers.length}
                        icon={ShieldCheck}
                    />

                    <StatCard
                        label="Salesmen"
                        value={salesmen.length}
                        icon={UserRound}
                    />

                    <StatCard
                        label="Dealers"
                        value={dealers.length}
                        icon={Building2}
                    />
                </div>

                {/* MAIN CARD */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* TABS */}

                    <div className="px-6 pt-5 border-b border-slate-200">
                        <div className="flex gap-8">
                            {TABS.map((tab) => {
                                const Icon =
                                    tab.icon;

                                const selected =
                                    activeTab ===
                                    tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(
                                                tab.id
                                            );

                                            setSearch("");
                                        }}
                                        className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold transition ${selected
                                            ? "border-orange-500 text-orange-600"
                                            : "border-transparent text-slate-400 hover:text-slate-700"
                                            }`}
                                    >
                                        <Icon size={16} />

                                        {tab.label}

                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] ${selected
                                                ? "bg-orange-50"
                                                : "bg-slate-100"
                                                }`}
                                        >
                                            {tab.id === "ho"
                                                ? hoUsers.length
                                                : tab.id ===
                                                    "salesmen"
                                                    ? salesmen.length
                                                    : dealers.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SEARCH */}

                    <div className="p-5 flex items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by name, mobile or email..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>
                    </div>

                    {/* DATA */}

                    {loading ? (
                        <div className="py-24 flex flex-col items-center">
                            <Loader2 className="animate-spin text-orange-500 w-8 h-8" />

                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">
                                Loading Users
                            </p>
                        </div>
                    ) : (
                        <>
                            {activeTab ===
                                "ho" && (
                                    <HOTable
                                        users={currentData}
                                        onView={setSelectedUser}
                                    />
                                )}

                            {activeTab ===
                                "salesmen" && (
                                    <SalesmenTable
                                        users={currentData}
                                        onView={setSelectedUser}
                                    />
                                )}

                            {activeTab ===
                                "dealers" && (
                                    <DealersTable
                                        users={currentData}
                                        onView={setSelectedUser}
                                    />
                                )}
                        </>
                    )}
                </div>
            </main>

            {showCreate && (
                <CreateUserModal
                    type={activeTab}
                    hoUsers={hoUsers}
                    salesmen={salesmen}
                    onClose={() =>
                        setShowCreate(false)
                    }
                    onCreated={() => {
                        setShowCreate(false);
                        loadUsers();
                    }}
                />
            )}

            {selectedUser && (
                <UserDetailsDrawer
                    type={activeTab}
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
}

/* ======================================================
   HO TABLE
====================================================== */

const HOTable = ({ users, onView }) => {
    return (
        <TableWrapper>
            <thead>
                <TableHeader>
                    <TH>User</TH>
                    <TH>Role</TH>
                    <TH>Department</TH>
                    <TH>Reports To</TH>
                    <TH>Status</TH>
                    <TH />
                </TableHeader>
            </thead>

            <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                    <tr
                        key={user._id}
                        onClick={() => onView(user)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <UserCell
                            name={user.name}
                            email={user.email}
                            mobile={user.mobile}
                        />

                        <TD>
                            <Badge>
                                {user.role}
                            </Badge>
                        </TD>

                        <TD>
                            {user.department ||
                                "—"}
                        </TD>

                        <TD>
                            {user.reportsTo
                                ?.name || "—"}
                        </TD>

                        <TD>
                            <Status
                                active={
                                    user.isActive
                                }
                            />
                        </TD>

                        <Action />
                    </tr>
                ))}

                <Empty users={users} />
            </tbody>
        </TableWrapper>
    );
};

/* ======================================================
   SALESMAN TABLE
====================================================== */

const SalesmenTable = ({ users, onView }) => {
    return (
        <TableWrapper>
            <thead>
                <TableHeader>
                    <TH>Salesman</TH>
                    <TH>Employee Code</TH>
                    <TH>Team Leader</TH>
                    <TH>Mobile</TH>
                    <TH>Status</TH>
                    <TH />
                </TableHeader>
            </thead>

            <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                    <tr
                        key={user._id}
                        onClick={() => onView(user)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <UserCell
                            name={user.name}
                            email={user.email}
                            mobile={user.mobile}
                        />

                        <TD>
                            {user.employeeCode ||
                                "—"}
                        </TD>

                        <TD>
                            {user.teamLeader
                                ?.name || "—"}
                        </TD>

                        <TD>
                            {user.mobile ||
                                "—"}
                        </TD>

                        <TD>
                            <Status
                                active={
                                    user.isActive
                                }
                            />
                        </TD>

                        <Action />
                    </tr>
                ))}

                <Empty users={users} />
            </tbody>
        </TableWrapper>
    );
};

/* ======================================================
   DEALER TABLE
====================================================== */

const DealersTable = ({ users, onView }) => {
    return (
        <TableWrapper>
            <thead>
                <TableHeader>
                    <TH>Dealer</TH>
                    <TH>Location</TH>
                    <TH>Salesman</TH>
                    <TH>Team Leader</TH>
                    <TH>Category</TH>
                    <TH>Status</TH>
                    <TH />
                </TableHeader>
            </thead>

            <tbody className="divide-y divide-slate-100">
                {users.map((dealer) => (
                    <tr
                        key={dealer._id}
                        onClick={() => onView(dealer)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <UserCell
                            name={
                                dealer.dealerName
                            }
                            email={
                                dealer.contact
                                    ?.email
                            }
                            mobile={
                                dealer.contact
                                    ?.mobileNumber
                            }
                        />

                        <TD>
                            <div className="flex items-center gap-1.5">
                                <MapPin
                                    size={13}
                                    className="text-slate-400"
                                />

                                {dealer.address
                                    ?.city ||
                                    dealer.address
                                        ?.district ||
                                    "—"}
                            </div>
                        </TD>

                        <TD>
                            {dealer.salesman
                                ?.name || "—"}
                        </TD>

                        <TD>
                            {dealer.teamLeader
                                ?.name || "—"}
                        </TD>

                        <TD>
                            <Badge>
                                {dealer.dealerCategory ||
                                    "—"}
                            </Badge>
                        </TD>

                        <TD>
                            <Status
                                active={
                                    dealer.status ===
                                    "active"
                                }
                            />
                        </TD>

                        <Action />
                    </tr>
                ))}

                <Empty users={users} />
            </tbody>
        </TableWrapper>
    );
};

/* ======================================================
   CREATE MODAL
====================================================== */

const CreateUserModal = ({
    type,
    hoUsers,
    salesmen,
    onClose,
    onCreated,
}) => {
    const [saving, setSaving] =
        useState(false);

    const [form, setForm] =
        useState({});

    const update = (
        key,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const createUser =
        async () => {
            try {
                setSaving(true);

                let endpoint;
                let body;

                if (type === "ho") {
                    endpoint =
                        "/ho-users";

                    body = {
                        name: form.name,
                        mobile:
                            form.mobile || "",
                        email:
                            form.email || "",
                        role:
                            form.role ||
                            "teamLeader",
                        department:
                            form.department ||
                            "sales",
                    };
                }

                if (
                    type === "salesmen"
                ) {
                    endpoint =
                        "/salesmen";

                    body = {
                        name: form.name,
                        employeeCode:
                            form.employeeCode ||
                            "",
                        mobile:
                            form.mobile || "",
                        email:
                            form.email || "",
                        teamLeader:
                            form.teamLeader,
                    };
                }

                if (
                    type === "dealers"
                ) {
                    const salesman =
                        salesmen.find(
                            (item) =>
                                item._id ===
                                form.salesman
                        );

                    endpoint =
                        "/dealers";

                    body = {
                        dealerName:
                            form.dealerName,

                        proprietorNames:
                            form.proprietorNames ||
                            "",

                        contactPerson:
                            form.contactPerson ||
                            "",

                        salesman:
                            form.salesman,

                        teamLeader:
                            salesman
                                ?.teamLeader?._id,

                        address: {
                            dealerAddress:
                                form.address ||
                                "",

                            country:
                                "India",

                            state:
                                form.state ||
                                "Rajasthan",

                            district:
                                form.district ||
                                "",

                            city:
                                form.city || "",

                            pincode:
                                form.pincode ||
                                "",
                        },

                        tax: {
                            panNumber:
                                form.panNumber ||
                                "",

                            gstNumber:
                                form.gstNumber ||
                                "",
                        },

                        contact: {
                            email:
                                form.email || "",

                            phoneNumber:
                                form.phone ||
                                "",

                            mobileNumber:
                                form.mobile ||
                                "",

                            whatsappNumber:
                                form.whatsapp ||
                                form.mobile ||
                                "",
                        },

                        dealerCategory:
                            form.dealerCategory ||
                            "",

                        creditLimit:
                            Number(
                                form.creditLimit
                            ) || 0,

                        brandMapping:
                            form.brandMapping
                                ? form.brandMapping
                                    .split(",")
                                    .map((item) =>
                                        item.trim()
                                    )
                                    .filter(Boolean)
                                : [],

                        status: "active",

                        login: {
                            mobile:
                                form.mobile ||
                                "",

                            isRegistered:
                                true,
                        },
                    };
                }

                const response =
                    await fetch(
                        `${API_BASE}${endpoint}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify(
                                body
                            ),
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Failed to create user"
                    );
                }

                onCreated();
            } catch (error) {
                alert(error.message);
            } finally {
                setSaving(false);
            }
        };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* HEADER */}

                <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-orange-500">
                            New User
                        </p>

                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            {type === "ho"
                                ? "Add Head Office User"
                                : type ===
                                    "salesmen"
                                    ? "Add Salesman"
                                    : "Add Dealer"}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {type === "ho" && (
                        <HOForm
                            form={form}
                            update={update}
                        />
                    )}

                    {type ===
                        "salesmen" && (
                            <SalesmanForm
                                form={form}
                                update={update}
                                hoUsers={hoUsers}
                            />
                        )}

                    {type ===
                        "dealers" && (
                            <DealerForm
                                form={form}
                                update={update}
                                salesmen={
                                    salesmen
                                }
                            />
                        )}
                </div>

                <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving}
                        onClick={createUser}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving && (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        )}

                        Create User
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ======================================================
   FORMS
====================================================== */

const HOForm = ({
    form,
    update,
}) => (
    <div className="grid grid-cols-2 gap-4">
        <Field
            label="Full Name"
            value={form.name}
            onChange={(v) =>
                update("name", v)
            }
        />

        <Field
            label="Mobile"
            value={form.mobile}
            onChange={(v) =>
                update("mobile", v)
            }
        />

        <Field
            label="Email"
            value={form.email}
            onChange={(v) =>
                update("email", v)
            }
        />

        <Select
            label="Role"
            value={form.role}
            onChange={(v) =>
                update("role", v)
            }
            options={[
                [
                    "teamLeader",
                    "Team Leader",
                ],
                [
                    "admin",
                    "Admin",
                ],
                [
                    "superAdmin",
                    "Super Admin",
                ],
                [
                    "accounts",
                    "Accounts",
                ],
                [
                    "support",
                    "Support",
                ],
                [
                    "inventory",
                    "Inventory",
                ],
            ]}
        />

        <Field
            label="Department"
            value={form.department}
            onChange={(v) =>
                update(
                    "department",
                    v
                )
            }
            placeholder="Sales"
        />
    </div>
);

const SalesmanForm = ({
    form,
    update,
    hoUsers,
}) => (
    <div className="grid grid-cols-2 gap-4">
        <Field
            label="Name"
            value={form.name}
            onChange={(v) =>
                update("name", v)
            }
        />

        <Field
            label="Employee Code"
            value={
                form.employeeCode
            }
            onChange={(v) =>
                update(
                    "employeeCode",
                    v
                )
            }
        />

        <Field
            label="Mobile"
            value={form.mobile}
            onChange={(v) =>
                update("mobile", v)
            }
        />

        <Field
            label="Email"
            value={form.email}
            onChange={(v) =>
                update("email", v)
            }
        />

        <Select
            label="Team Leader"
            value={
                form.teamLeader
            }
            onChange={(v) =>
                update(
                    "teamLeader",
                    v
                )
            }
            options={hoUsers
                .filter(
                    (user) =>
                        user.role ===
                        "teamLeader"
                )
                .map((user) => [
                    user._id,
                    user.name,
                ])}
        />
    </div>
);

const DealerForm = ({
    form,
    update,
    salesmen,
}) => (
    <div className="space-y-7">
        <FormSection title="Dealer Information">
            <Field
                label="Dealer Name"
                value={
                    form.dealerName
                }
                onChange={(v) =>
                    update(
                        "dealerName",
                        v
                    )
                }
            />

            <Field
                label="Proprietor"
                value={
                    form.proprietorNames
                }
                onChange={(v) =>
                    update(
                        "proprietorNames",
                        v
                    )
                }
            />

            <Field
                label="Contact Person"
                value={
                    form.contactPerson
                }
                onChange={(v) =>
                    update(
                        "contactPerson",
                        v
                    )
                }
            />

            <Select
                label="Salesman"
                value={
                    form.salesman
                }
                onChange={(v) =>
                    update(
                        "salesman",
                        v
                    )
                }
                options={salesmen.map(
                    (salesman) => [
                        salesman._id,
                        salesman.name,
                    ]
                )}
            />
        </FormSection>

        <FormSection title="Contact">
            <Field
                label="Mobile"
                value={form.mobile}
                onChange={(v) =>
                    update("mobile", v)
                }
            />

            <Field
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(v) =>
                    update(
                        "whatsapp",
                        v
                    )
                }
            />

            <Field
                label="Email"
                value={form.email}
                onChange={(v) =>
                    update("email", v)
                }
            />

            <Field
                label="Phone"
                value={form.phone}
                onChange={(v) =>
                    update("phone", v)
                }
            />
        </FormSection>

        <FormSection title="Address">
            <Field
                label="Address"
                value={form.address}
                onChange={(v) =>
                    update("address", v)
                }
            />

            <Field
                label="City"
                value={form.city}
                onChange={(v) =>
                    update("city", v)
                }
            />

            <Field
                label="District"
                value={
                    form.district
                }
                onChange={(v) =>
                    update(
                        "district",
                        v
                    )
                }
            />

            <Field
                label="Pincode"
                value={
                    form.pincode
                }
                onChange={(v) =>
                    update(
                        "pincode",
                        v
                    )
                }
            />
        </FormSection>

        <FormSection title="Business Details">
            <Field
                label="GST Number"
                value={
                    form.gstNumber
                }
                onChange={(v) =>
                    update(
                        "gstNumber",
                        v
                    )
                }
            />

            <Field
                label="PAN Number"
                value={
                    form.panNumber
                }
                onChange={(v) =>
                    update(
                        "panNumber",
                        v
                    )
                }
            />

            <Field
                label="Dealer Category"
                value={
                    form.dealerCategory
                }
                onChange={(v) =>
                    update(
                        "dealerCategory",
                        v
                    )
                }
            />

            <Field
                label="Credit Limit"
                type="number"
                value={
                    form.creditLimit
                }
                onChange={(v) =>
                    update(
                        "creditLimit",
                        v
                    )
                }
            />

            <Field
                label="Brand Mapping"
                value={
                    form.brandMapping
                }
                placeholder="LG, Samsung"
                onChange={(v) =>
                    update(
                        "brandMapping",
                        v
                    )
                }
            />
        </FormSection>
    </div>
);

/* ======================================================
   SMALL COMPONENTS
====================================================== */

const StatCard = ({
    label,
    value,
    icon: Icon,
}) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <Icon size={20} />
        </div>

        <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                {label}
            </p>

            <p className="text-2xl font-black text-slate-900 mt-1">
                {value}
            </p>
        </div>
    </div>
);

const TableWrapper = ({
    children,
}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            {children}
        </table>
    </div>
);

const TableHeader = ({
    children,
}) => (
    <tr className="bg-slate-50 border-y border-slate-200">
        {children}
    </tr>
);

const TH = ({ children }) => (
    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {children}
    </th>
);

const TD = ({ children }) => (
    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
        {children}
    </td>
);

const UserCell = ({
    name,
    email,
    mobile,
}) => (
    <td className="px-6 py-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 flex items-center justify-center text-orange-600 font-black">
                {(name || "?")
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div>
                <p className="font-black text-sm text-slate-900">
                    {name}
                </p>

                <p className="text-[11px] text-slate-400 mt-0.5">
                    {mobile ||
                        email ||
                        "No contact information"}
                </p>
            </div>
        </div>
    </td>
);

const Status = ({
    active,
}) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
            }`}
    >
        {active ? (
            <CheckCircle2 size={11} />
        ) : (
            <XCircle size={11} />
        )}

        {active
            ? "Active"
            : "Inactive"}
    </span>
);

const Badge = ({ children }) => (
    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold capitalize">
        {children}
    </span>
);

const Action = () => (
    <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
            View

            <ChevronRight size={15} />
        </div>
    </td>
);

const Empty = ({ users }) => {
    if (users.length > 0)
        return null;

    return (
        <tr>
            <td
                colSpan="10"
                className="py-20 text-center text-slate-400 text-sm font-semibold"
            >
                No users found.
            </td>
        </tr>
    );
};

const FormSection = ({
    title,
    children,
}) => (
    <div>
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-black mb-4">
            {title}
        </h3>

        <div className="grid grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const Field = ({
    label,
    value = "",
    onChange,
    placeholder = "",
    type = "text",
}) => (
    <label className="block">
        <span className="block text-[11px] font-black text-slate-500 mb-2">
            {label}
        </span>

        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(event) =>
                onChange(
                    event.target.value
                )
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        />
    </label>
);

const Select = ({
    label,
    value = "",
    onChange,
    options,
}) => (
    <label className="block">
        <span className="block text-[11px] font-black text-slate-500 mb-2">
            {label}
        </span>

        <select
            value={value}
            onChange={(event) =>
                onChange(
                    event.target.value
                )
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:border-orange-500"
        >
            <option value="">
                Select {label}
            </option>

            {options.map(
                ([value, name]) => (
                    <option
                        key={value}
                        value={value}
                    >
                        {name}
                    </option>
                )
            )}
        </select>
    </label>
);

/* ======================================================
   USER DETAILS DRAWER
====================================================== */

const UserDetailsDrawer = ({
    user,
    type,
    onClose,
}) => {
    if (!user) return null;

    const isDealer =
        type === "dealers";

    const isSalesman =
        type === "salesmen";

    const name =
        user.dealerName ||
        user.name ||
        "Unknown User";

    const mobile = isDealer
        ? user.contact?.mobileNumber
        : user.mobile;

    const email = isDealer
        ? user.contact?.email
        : user.email;

    const active = isDealer
        ? user.status === "active"
        : user.isActive;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/30 backdrop-blur-[2px] flex justify-end">
            <div
                className="
          w-full max-w-[580px]
          h-full
          bg-[#F8F9FB]
          shadow-2xl
          flex flex-col
          animate-in slide-in-from-right duration-300
        "
            >
                {/* HEADER */}

                <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-start justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black">
                            {name
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-slate-400">
                                    {type === "ho"
                                        ? "Head Office"
                                        : type ===
                                            "salesmen"
                                            ? "Salesman"
                                            : "Dealer"}
                                </p>

                                <Status
                                    active={active}
                                />
                            </div>

                            <h2 className="text-xl font-black text-slate-900 mt-1 truncate">
                                {name}
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                ID: {user._id}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* QUICK CONTACT */}

                    <DetailSection
                        title="Contact Information"
                        icon={Phone}
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Mobile"
                                value={mobile}
                            />

                            <DetailItem
                                label="Email"
                                value={email}
                            />

                            {isDealer && (
                                <>
                                    <DetailItem
                                        label="Phone"
                                        value={
                                            user.contact
                                                ?.phoneNumber
                                        }
                                    />

                                    <DetailItem
                                        label="WhatsApp"
                                        value={
                                            user.contact
                                                ?.whatsappNumber
                                        }
                                    />
                                </>
                            )}
                        </DetailGrid>
                    </DetailSection>

                    {/* HO USER */}

                    {type === "ho" && (
                        <>
                            <DetailSection
                                title="Organization"
                                icon={BriefcaseBusiness}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Role"
                                        value={user.role}
                                    />

                                    <DetailItem
                                        label="Department"
                                        value={
                                            user.department
                                        }
                                    />

                                    <DetailItem
                                        label="Reports To"
                                        value={
                                            user.reportsTo
                                                ?.name
                                        }
                                    />

                                    <DetailItem
                                        label="Account Status"
                                        value={
                                            user.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {user.profile &&
                                Object.keys(
                                    user.profile
                                ).length > 0 && (
                                    <DynamicSection
                                        title="Additional Profile"
                                        data={user.profile}
                                    />
                                )}

                            {user.permissions &&
                                Object.keys(
                                    user.permissions
                                ).length > 0 && (
                                    <DynamicSection
                                        title="Permissions"
                                        data={
                                            user.permissions
                                        }
                                    />
                                )}
                        </>
                    )}

                    {/* SALESMAN */}

                    {isSalesman && (
                        <>
                            <DetailSection
                                title="Employment"
                                icon={UserCheck}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Employee Code"
                                        value={
                                            user.employeeCode
                                        }
                                    />

                                    <DetailItem
                                        label="Team Leader"
                                        value={
                                            user.teamLeader
                                                ?.name
                                        }
                                    />

                                    <DetailItem
                                        label="Leader Department"
                                        value={
                                            user.teamLeader
                                                ?.department
                                        }
                                    />

                                    <DetailItem
                                        label="Status"
                                        value={
                                            user.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {user.profile &&
                                Object.keys(
                                    user.profile
                                ).length > 0 && (
                                    <DynamicSection
                                        title="Additional Profile"
                                        data={user.profile}
                                    />
                                )}
                        </>
                    )}

                    {/* DEALER */}

                    {isDealer && (
                        <>
                            <DetailSection
                                title="Dealer Information"
                                icon={Building2}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Dealer Name"
                                        value={
                                            user.dealerName
                                        }
                                    />

                                    <DetailItem
                                        label="Serial Number"
                                        value={
                                            user.serialNumber
                                        }
                                    />

                                    <DetailItem
                                        label="Proprietor / Partners"
                                        value={
                                            user.proprietorNames
                                        }
                                    />

                                    <DetailItem
                                        label="Contact Person"
                                        value={
                                            user.contactPerson
                                        }
                                    />

                                    <DetailItem
                                        label="Dealer Category"
                                        value={
                                            user.dealerCategory
                                        }
                                    />

                                    <DetailItem
                                        label="Credit Limit"
                                        value={
                                            user.creditLimit
                                                ? `₹${Number(
                                                    user.creditLimit
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`
                                                : "—"
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {/* ASSIGNMENT */}

                            <DetailSection
                                title="Sales Assignment"
                                icon={Users}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Salesman"
                                        value={
                                            user.salesman
                                                ?.name
                                        }
                                    />

                                    <DetailItem
                                        label="Employee Code"
                                        value={
                                            user.salesman
                                                ?.employeeCode
                                        }
                                    />

                                    <DetailItem
                                        label="Team Leader"
                                        value={
                                            user.teamLeader
                                                ?.name
                                        }
                                    />

                                    <DetailItem
                                        label="Department"
                                        value={
                                            user.teamLeader
                                                ?.department
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {/* ADDRESS */}

                            <DetailSection
                                title="Dealer Address"
                                icon={MapPinned}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        wide
                                        label="Address"
                                        value={
                                            user.address
                                                ?.dealerAddress
                                        }
                                    />

                                    <DetailItem
                                        label="City"
                                        value={
                                            user.address
                                                ?.city
                                        }
                                    />

                                    <DetailItem
                                        label="District"
                                        value={
                                            user.address
                                                ?.district
                                        }
                                    />

                                    <DetailItem
                                        label="State"
                                        value={
                                            user.address
                                                ?.state
                                        }
                                    />

                                    <DetailItem
                                        label="Country"
                                        value={
                                            user.address
                                                ?.country
                                        }
                                    />

                                    <DetailItem
                                        label="Pincode"
                                        value={
                                            user.address
                                                ?.pincode
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {/* TAX */}

                            <DetailSection
                                title="Tax & Identity"
                                icon={Hash}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="PAN Number"
                                        value={
                                            user.tax
                                                ?.panNumber
                                        }
                                    />

                                    <DetailItem
                                        label="GST Number"
                                        value={
                                            user.tax
                                                ?.gstNumber
                                        }
                                    />

                                    <DetailItem
                                        label="Aadhaar Number"
                                        value={
                                            user.aadhaarNumber
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {/* BANK */}

                            <DetailSection
                                title="Bank Details"
                                icon={Landmark}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Bank Name"
                                        value={
                                            user.bankDetails
                                                ?.bankName
                                        }
                                    />

                                    <DetailItem
                                        label="Account Number"
                                        value={
                                            user.bankDetails
                                                ?.accountNumber
                                        }
                                    />

                                    <DetailItem
                                        label="Branch"
                                        value={
                                            user.bankDetails
                                                ?.branch
                                        }
                                    />

                                    <DetailItem
                                        label="IFSC Code"
                                        value={
                                            user.bankDetails
                                                ?.ifscCode
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>

                            {/* SHIPPING */}

                            <DetailSection
                                title="Shipping Address"
                                icon={MapPin}
                            >
                                {user.shipping
                                    ?.sameAsDealerAddress ? (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                                        <CheckCircle2
                                            size={16}
                                        />

                                        Same as dealer
                                        address
                                    </div>
                                ) : (
                                    <DetailGrid>
                                        <DetailItem
                                            wide
                                            label="Address"
                                            value={
                                                user.shipping
                                                    ?.address
                                            }
                                        />

                                        <DetailItem
                                            label="City"
                                            value={
                                                user.shipping
                                                    ?.city
                                            }
                                        />

                                        <DetailItem
                                            label="District"
                                            value={
                                                user.shipping
                                                    ?.district
                                            }
                                        />

                                        <DetailItem
                                            label="State"
                                            value={
                                                user.shipping
                                                    ?.state
                                            }
                                        />

                                        <DetailItem
                                            label="Country"
                                            value={
                                                user.shipping
                                                    ?.country
                                            }
                                        />

                                        <DetailItem
                                            label="Pincode"
                                            value={
                                                user.shipping
                                                    ?.pincode
                                            }
                                        />
                                    </DetailGrid>
                                )}
                            </DetailSection>

                            {/* BRAND MAPPING */}

                            <DetailSection
                                title="Brand Mapping"
                                icon={BriefcaseBusiness}
                            >
                                {user.brandMapping
                                    ?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {user.brandMapping.map(
                                            (brand) => (
                                                <span
                                                    key={brand}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
                                                >
                                                    {brand}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <EmptyValue />
                                )}
                            </DetailSection>

                            {/* LOGIN */}

                            <DetailSection
                                title="App Registration"
                                icon={ShieldCheck}
                            >
                                <DetailGrid>
                                    <DetailItem
                                        label="Login Mobile"
                                        value={
                                            user.login
                                                ?.mobile
                                        }
                                    />

                                    <DetailItem
                                        label="Registered"
                                        value={
                                            user.login
                                                ?.isRegistered
                                                ? "Yes"
                                                : "No"
                                        }
                                    />

                                    <DetailItem
                                        label="Last Login"
                                        value={
                                            user.login
                                                ?.lastLoginAt
                                                ? new Date(
                                                    user.login
                                                        .lastLoginAt
                                                ).toLocaleString()
                                                : "Never"
                                        }
                                    />
                                </DetailGrid>
                            </DetailSection>
                        </>
                    )}

                    {/* META */}

                    <DetailSection
                        title="Record Information"
                        icon={CreditCard}
                    >
                        <DetailGrid>
                            <DetailItem
                                label="Created"
                                value={
                                    user.createdAt
                                        ? new Date(
                                            user.createdAt
                                        ).toLocaleString()
                                        : null
                                }
                            />

                            <DetailItem
                                label="Last Updated"
                                value={
                                    user.updatedAt
                                        ? new Date(
                                            user.updatedAt
                                        ).toLocaleString()
                                        : null
                                }
                            />
                        </DetailGrid>
                    </DetailSection>
                </div>

                {/* FOOTER */}

                <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>

                    <div className="flex gap-2">
                        <button
                            disabled
                            title="Update API will be added next"
                            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-bold cursor-not-allowed"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ======================================================
   DETAIL HELPERS
====================================================== */

const DetailSection = ({
    title,
    icon: Icon,
    children,
}) => {
    return (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Icon size={15} />
                </div>

                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {title}
                </h3>
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const DetailGrid = ({
    children,
}) => {
    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {children}
        </div>
    );
};

const DetailItem = ({
    label,
    value,
    wide = false,
}) => {
    const empty =
        value === undefined ||
        value === null ||
        value === "";

    return (
        <div
            className={
                wide
                    ? "col-span-2"
                    : ""
            }
        >
            <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                {label}
            </p>

            <p
                className={`text-sm font-semibold break-words ${empty
                    ? "text-slate-300"
                    : "text-slate-800"
                    }`}
            >
                {empty ? "—" : String(value)}
            </p>
        </div>
    );
};

const EmptyValue = () => (
    <p className="text-sm text-slate-300 font-semibold">
        No information available
    </p>
);

const DynamicSection = ({
    title,
    data,
}) => {
    return (
        <DetailSection
            title={title}
            icon={BriefcaseBusiness}
        >
            <DetailGrid>
                {Object.entries(data).map(
                    ([key, value]) => (
                        <DetailItem
                            key={key}
                            label={key
                                .replace(
                                    /([A-Z])/g,
                                    " $1"
                                )
                                .replace(/^./, (str) =>
                                    str.toUpperCase()
                                )}
                            value={
                                typeof value ===
                                    "object"
                                    ? JSON.stringify(
                                        value
                                    )
                                    : value
                            }
                        />
                    )
                )}
            </DetailGrid>
        </DetailSection>
    );
};