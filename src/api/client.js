
import axios from 'axios';

const client = axios.create({
    baseURL:'https://api.b2belectromart.com/api',

    timeout: 20000,

    headers: {
        'Content-Type': 'application/json',
    },
});

// REQUEST INTERCEPTOR
client.interceptors.request.use(
    config => {
        // JWT authentication baad mein integrate kar sakte hain.
        return config;
    },
    error => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
client.interceptors.response.use(
    response => response,
    error => {
        console.log(
            'API Error:',
            error.response?.data?.message ||
            error.message,
        );

        return Promise.reject(error);
    },
);

export default client;
