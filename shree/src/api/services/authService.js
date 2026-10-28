import { http } from '../client'
import { EP } from '../endpoints'
import { ApiError } from '../errors'
import { getToken, setToken, clearToken } from '../token'

export const authService = {
  isAuthenticated: () => !!getToken(),

  // Django: POST /auth/login/ {password} -> {token} (DRF Token) or {access, refresh} (SimpleJWT).
  // If your backend also needs a username, add it to this payload.
  async login({ password }) {
    const { data } = await http.post(EP.LOGIN, { password }, { skipAuthRedirect: true })
    const token = data?.token ?? data?.access
    if (!token) throw new ApiError('Login response did not contain a token.')
    setToken(token)
  },

  // Django: POST /auth/change-password/ {old_password, new_password}. Wrong old password -> 400 {"old_password": [...]}.
  async changePassword({ oldPassword, newPassword }) {
    await http.post(EP.CHANGE_PASSWORD, { old_password: oldPassword, new_password: newPassword }, { skipAuthRedirect: true })
  },

  logout() { clearToken() },
}
