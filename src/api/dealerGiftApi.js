
import client from "./client";

export const searchGiftDealers = async (search) => {
    const { data } = await client.get(
        "/admin/dealer-gifts/dealers",
        { params: { search } }
    );
    return data;
};

export const getDealerGiftInventories = async (params = {}) => {
    const { data } = await client.get(
        "/admin/dealer-gifts",
        { params }
    );
    return data;
};

export const createDealerGift = async (payload) => {
    const { data } = await client.post(
        "/admin/dealer-gifts",
        payload
    );
    return data;
};

export const updateDealerGift = async (id, payload) => {
    const { data } = await client.patch(
        `/admin/dealer-gifts/${id}`,
        payload
    );
    return data;
};

export const addDealerGiftStock = async (id, quantity) => {
    const { data } = await client.post(
        `/admin/dealer-gifts/${id}/add-stock`,
        { quantity }
    );
    return data;
};
