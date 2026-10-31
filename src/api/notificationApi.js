const API_BASE = 'http://78.159.126.218/api';


export const sendPushNotification =
    async payload => {
        const response =
            await fetch(
                `${API_BASE}/notifications/send`,
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body:
                        JSON.stringify(
                            payload,
                        ),
                },
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data?.message ||
                'Failed to send notification',
            );
        }


        return data;
    };