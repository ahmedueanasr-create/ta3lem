import { io } from 'socket.io-client';

const PATH = import.meta.env.VITE_SOCKET_PATH || '/socket';

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  const token = localStorage.getItem('accessToken');
  socket = io({ path: PATH, auth: { token } });
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}

export { socket };
