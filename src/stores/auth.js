import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN'))

  const setTokens = (tokens) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    user.value = tokens.user || null
    
    localStorage.setItem('access_token', tokens.accessToken)
    localStorage.setItem('refresh_token', tokens.refreshToken)
    localStorage.setItem('grant_type', tokens.grantType)
    localStorage.setItem('refresh_token_expire', tokens.refreshTokenExpire)
    
    if (tokens.user) {
      localStorage.setItem('user', JSON.stringify(tokens.user))
    }
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('grant_type')
    localStorage.removeItem('refresh_token_expire')
    localStorage.removeItem('user')
  }



  const logout = async () => {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    setTokens,
    clearTokens,
    logout
  }
})