import client from './client';

export const getGifts = async (params = {}) => {
    const { data } = await client.get('/admin/gifts', { params });
    return data;
};

export const createGift = async payload => {
    const { data } = await client.post('/admin/gifts', payload);
    return data;
};

export const updateGift = async (id, payload) => {
    const { data } = await client.patch(`/admin/gifts/${id}`, payload);
    return data;
};

export const setGiftActive = async (id, isActive) => {
    return updateGift(id, { isActive });
};