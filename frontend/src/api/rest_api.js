import queryString from "query-string";
import { SYMBL_BASE_URL } from '../config'

const retryStatusCodes = [408, 500, 502, 503, 504, 522, 524]

const tokenKey = 'symblToken';
export const GET = ({ path, params, retries = 3 }) => {
    let url = `${SYMBL_BASE_URL}/v1/${path}`;
    if (params) {
        const qs = queryString.stringify(params);
        url += "?" + qs;
    }

    return new Promise((resolve, reject) => {
        window
            .fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Authorization": `Bearer ${window.localStorage.getItem(tokenKey)}`,
                },
            })
            .then((response) => {
                if (response.ok) resolve(response.json());

                if (retries > 0 && retryStatusCodes.includes(response.status)) {
                    return GET({ path, params, retries: retries - 1 })
                } else {
                    reject(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const POST = ({ path, body, retries = 3 }) => {
    return new Promise((resolve, reject) => {
        window
            .fetch(SYMBL_BASE_URL + path, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${window.localStorage.getItem(tokenKey)}`,
                },
            })
            .then((response) => {
                if (response.ok) resolve(response.json());

                if (retries > 0 && retryStatusCodes.includes(response.status)) {
                    return POST({ path, body, retries: retries - 1 })
                } else {
                    reject(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const PUT = ({ path, body, retries = 3 }) => {
    return new Promise((resolve, reject) => {
        window
            .fetch(`${SYMBL_BASE_URL}/v1/${path}`, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${window.localStorage.getItem(tokenKey)}`,
                },
            })
            .then((response) => {
                if (response.ok) resolve(response.json());

                if (retries > 0 && retryStatusCodes.includes(response.status)) {
                    return PUT({ path, body, retries: retries - 1 })
                } else {
                    reject(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const DELETE = ({ path, retries = 3 }) => {
    return new Promise((resolve, reject) => {
        window
            .fetch(`${SYMBL_BASE_URL}/v1/${path}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${window.localStorage.getItem(tokenKey)}`,
                },
            })
            .then((response) => {
                if (response.ok) resolve(response.json());

                if (retries > 0 && retryStatusCodes.includes(response.status)) {
                    return DELETE({ path, retries: retries - 1 })
                } else {
                    reject(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};