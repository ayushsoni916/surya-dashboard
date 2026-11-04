import { API_BASE } from "../config/api";

const ROUTES = {
    teamLeader: "team-leader",
    admin: "admin",
    warehouse: "warehouse",
};

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong");
    }

    return result;
};

export const getHOApprovalOrders = role => {
    const path = ROUTES[role];
    if (!path) throw new Error("Invalid approval role");

    return request(
        `${API_BASE}/admin/order-approvals/${path}`
    );
};

export const updateHOOrderApproval = (
    role,
    orderId,
    action,
    remark,
    actorId
) => {
    const path = ROUTES[role];
    if (!path) throw new Error("Invalid approval role");

    return request(
        `${API_BASE}/admin/order-approvals/${path}/${orderId}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                action,
                remark: remark.trim(),
                actorId: actorId.trim(),
            }),
        }
    );
};