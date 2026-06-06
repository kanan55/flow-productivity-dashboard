import axios from "axios";

// Create Axios instance with dynamic base URL support
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("flow-auth-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: async (email, password) => {
        const res = await api.post("/auth/register", { email, password });
        return res.data;
    },
    login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        return res.data;
    },
    getMe: async () => {
        const res = await api.get("/auth/me");
        return res.data;
    },
    updatePreferences: async (preferences) => {
        const res = await api.put("/auth/preferences", preferences);
        return res.data;
    },
};

export const taskAPI = {
    getAll: async () => {
        const res = await api.get("/tasks");
        return res.data;
    },
    create: async (taskData) => {
        const res = await api.post("/tasks", taskData);
        return res.data;
    },
    update: async (id, taskData) => {
        const res = await api.put(`/tasks/${id}`, taskData);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/tasks/${id}`);
        return res.data;
    },
    reorder: async (tasks) => {
        const res = await api.put("/tasks/reorder/batch", { tasks });
        return res.data;
    },
};

export const habitAPI = {
    getAll: async () => {
        const res = await api.get("/habits");
        return res.data;
    },
    create: async (habitData) => {
        const res = await api.post("/habits", habitData);
        return res.data;
    },
    update: async (id, habitData) => {
        const res = await api.put(`/habits/${id}`, habitData);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/habits/${id}`);
        return res.data;
    },
    checkin: async (id) => {
        const res = await api.post(`/habits/${id}/checkin`);
        return res.data;
    },
};

export const focusAPI = {
    getAll: async () => {
        const res = await api.get("/focus");
        return res.data;
    },
    start: async (sessionData) => {
        const res = await api.post("/focus", sessionData);
        return res.data;
    },
    end: async (id, completed) => {
        const res = await api.put(`/focus/${id}`, { completed });
        return res.data;
    },
};

export default api;
