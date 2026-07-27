import { io } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

let socket = null

export function getSocket() {
  return socket
}

export function connectSocket() {
  if (socket?.connected) return socket
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  })
  socket.on("connect_error", () => {})
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
