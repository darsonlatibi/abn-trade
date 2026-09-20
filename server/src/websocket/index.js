import { WebSocketServer } from "ws";

let wss = null;

export function startWebSocketServer(port) {
  if (wss) {
    console.log("ABN WS: WebSocket server already running.");
    return wss;
  }

  wss = new WebSocketServer({
    port,
    path: "/ws",
  });

  wss.on("listening", () => {
    console.log(`ABN WS: WebSocket server listening on ${port}/ws`);
  });

  wss.on("connection", (socket, request) => {
    console.log(
      `ABN WS: Client connected from ${request.socket.remoteAddress}`,
    );

    socket.send(
      JSON.stringify({
        type: "connection",
        success: true,
        message: "ABN Trade WebSocket connected.",
      }),
    );

    socket.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        console.log("ABN WS: Message received:", data);

        socket.send(
          JSON.stringify({
            type: "ack",
            success: true,
            data,
          }),
        );
      } catch {
        socket.send(
          JSON.stringify({
            type: "error",
            success: false,
            message: "Invalid JSON message.",
          }),
        );
      }
    });

    socket.on("close", () => {
      console.log("ABN WS: Client disconnected.");
    });

    socket.on("error", (error) => {
      console.error("ABN WS: Client error:", error.message);
    });
  });

  wss.on("error", (error) => {
    console.error("ABN WS: Server error:", error.message);
  });

  return wss;
}

export function getWebSocketServer() {
  return wss;
}

export function broadcast(data) {
  if (!wss) return;

  const payload = typeof data === "string" ? data : JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}
