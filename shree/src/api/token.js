// Admin auth token storage. sessionStorage = cleared when the browser tab closes (same as the old admin session).
const KEY = 'shree-admin-token'
const safe = fn => { try { return fn() } catch { return null } }
export const getToken = () => safe(() => sessionStorage.getItem(KEY))
export const setToken = t => safe(() => sessionStorage.setItem(KEY, t))
export const clearToken = () => safe(() => sessionStorage.removeItem(KEY))
