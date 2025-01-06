export const ROUTES = {
  home: '/',
  roomDetail: '/rooms/:roomCode',
  roomJoin: '/rooms/:roomCode/join',
  leaveRoom: '/rooms/:roomCode/leave',
  login: '/login',
  register: '/register',
} as const

export const FORM_INTENT_KEY = 'intent'

export const FORM_INTENT_VALUES = {
  register: 'register',
  login: 'login',
  leaveRoom: 'leaveRoom',
  joinRoom: 'joinRoom',
} as const

export const COOKIE_KEYS = {
  setCookie: 'Set-Cookie',
  getCookie: 'Cookie',
} as const
