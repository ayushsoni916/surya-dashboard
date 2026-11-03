import client from "./client";

export const getScratchRewards = async (params = {}) => {
    const response = await client.get(
        "/admin/scratch-rewards",
        { params }
    );

    return response.data;
};