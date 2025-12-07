import axios from "axios";
import { User } from "./types";
import { message } from "antd";

const SESSION_KEY = "app_user_session_v1";

// Create axios instance pointed at Laravel's API prefix
const api = axios.create({
    baseURL: "api",
    headers: { Accept: "application/json" },
});


function saveSession(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
        return null;
    }
}

export function logoutUser() {
    const session = getSession();
    if (session?.token) {
        api.post("/logout").catch(() => { });
    }
    localStorage.removeItem(SESSION_KEY);
}

// ---- Add token to requests automatically ----
api.interceptors.request.use((config) => {
    const session = getSession();
    const hasToken = !!session?.token;
    // Attach token when present. Also help debugging by logging request target and token presence (not the token value).
    if (hasToken) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    // Debug helper (do not log actual token)
    // eslint-disable-next-line no-console
    console.debug('[auth] request', { url: config.url, method: config.method, hasToken });
    return config;
});

// ---- Extract readable backend errors ----
function extractError(err: any) {
    if (err.response?.data) {
        const { message, errors } = err.response.data;
        return message || (errors ? Object.values(errors).flat().join(" ") : "Request failed");
    }
    return "Network error";
}

// ---- Auth functions ----
export async function loginUser(email: string, password: string): Promise<User> {
    try {
        const { data } = await api.post("/login", { email, password });

        // Token can be returned under various keys depending on server config
        const token = data?.token || data?.accessToken || data?.access_token || data?.data?.token;

        const userPayload = data.user ?? data.data ?? {};
        const user: User = {
            id: userPayload?.id,
            email: userPayload?.email || email,
            name: userPayload?.name || `${userPayload?.first_name || userPayload?.firstName || ""} ${userPayload?.last_name || userPayload?.lastName || ""}`.trim(),
            token: token,
        };

        saveSession(user);
        return user;
    } catch (err: any) {
        // Normalize axios / API errors into { message, errors, status }
        const resp = err?.response;
        if (resp?.data) {
            const msg = resp.data?.error || resp.data?.message || extractError(err);
            const errors = resp.data?.errors || {};
            throw { message: msg, errors, status: resp.status };
        }
        throw { message: err.message || 'Login failed', errors: {}, status: err?.status };
    }
}

export async function registerUser(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    companyName?: string
) {
    try {
        // API expects: name, company_name, email, password, password_confirmation
        const payload: any = {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        };
        if (companyName) payload.company_name = companyName;

        const { data } = await api.post("/register", payload);

        const token = data?.token || data?.accessToken || data?.access_token || data?.data?.token;
        const userPayload = data.user ?? data.data ?? {};

        const user: User = {
            id: userPayload?.id,
            email: userPayload?.email || email,
            name: userPayload?.name || name,
            token: token,
        };

        saveSession(user);
        return user;
    } catch (err: any) {
        if (err.response?.status === 422) {
            throw {
                message: err.response.data?.message || "Validation Failed",
                errors: err.response.data?.errors || {},
            };
        }
        throw {
            message: err.message || "Something went wrong",
            errors: {},
        };
    }
}


// ---- Authenticated fetch replacement ----
export function authFetch(url: string, config = {}) {
    return api(url, config);
}

export default { loginUser, registerUser, getSession, logoutUser, authFetch };
