const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

let socket: WebSocket | null = null;

const getWebSocketURL = (): string | null => {
  if (!API_BASE_URL) {
    console.error("VITE_APP_API_URL is not defined in your .env file.");
    return null;
  }

  // Convert http/https to ws/wss for the WebSocket protocol.
  const wsUrl = API_BASE_URL.replace(/^http/, "ws");

  return `${wsUrl}/ws`;
};

export const connectWebSocket = (
  onOpen: () => void,
  onMessage: (event: MessageEvent) => void,
  onClose: () => void,
  onError: (event: Event) => void,
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket is already connected.");
    return;
  }

  const url = getWebSocketURL();
  if (!url) return; // Don't connect if we can't get a URL (e.g., no token)

  socket = new WebSocket(url);

  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onclose = onClose;
  socket.onerror = onError;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getSocket = () => socket;
