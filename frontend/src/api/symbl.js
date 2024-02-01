import * as RestAPI from "./rest_api";
import { authConfig, SYMBL_BASE_URL } from '../config'

const authenticateSymbl = () => {
    return new Promise((resolve, reject) => {
        window
            .fetch(`${SYMBL_BASE_URL}/oauth2/token:generate`, {
                method: "POST",
                body: JSON.stringify({
                    type: "application",
                    appId: authConfig.appId,
                    appSecret: authConfig.appSecret,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((json) => {
                if (json.accessToken) {
                    window.localStorage.setItem('symblToken', json.accessToken);
                    resolve(window.localStorage.getItem('symblToken'));
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const fetchActionItems = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/action-items` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchAnalytics = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/analytics` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchFollowUps = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/follow-ups` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchMembers = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/members` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchMessages = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/messages` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchMetadata = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchQuestions = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/questions` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchSummary = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/summary` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchTopics = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({
            path: `/conversations/${conversationId}/topics`,
            params: { sentiment: true, refresh: true, parentRefs: true }
        })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

const fetchTrackers = (conversationId) => {
    return new Promise((resolve, reject) => {
        RestAPI.GET({ path: `/conversations/${conversationId}/trackers` })
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
};

export {
    authenticateSymbl,
    fetchActionItems,
    fetchAnalytics,
    fetchFollowUps,
    fetchMembers,
    fetchMessages,
    fetchMetadata,
    fetchQuestions,
    fetchSummary,
    fetchTopics,
    fetchTrackers,
};