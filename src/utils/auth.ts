const TOKEN_KEY = 'token'
const ROLE_FLAG = 'role_flag'

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY)
}

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

const getRoleFlag = () => {
  return localStorage.getItem(ROLE_FLAG)
}

const setRoleFlag = (role_flag: string) => {
  localStorage.setItem(ROLE_FLAG, role_flag)
}

const clearRoleFlag = () => {
  localStorage.removeItem(ROLE_FLAG)
}

export { isLogin, getToken, setToken, clearToken ,getRoleFlag,setRoleFlag,clearRoleFlag}
