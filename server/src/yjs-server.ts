import WebSocket from "ws";
import http from "http";

import createConnection from "./db/connection";
import {
  clearInactiveDocs,
  loadDocument,
  saveSnapshots,
} from "./utils/yDoc";
import { Socket } from "net";

// Y-websocket has no TypeScript support, so we need to use require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setupWSConnection, docs } = require("y-websocket/bin/utils");

// Configuration
const CONFIG = {
  host: process.env.HOST || "localhost",
  port: 1234,
  saveInterval: 10 * 1000, // 10 seconds
  inactiveThreshold: 60 * 60 * 1000, // 1 hour in milliseconds
};

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

// HTTP server setup
const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

// WebSocket connection handling
wss.on("connection", async (ws, req) => {
  await setupWSConnection(ws, req);
});

server.on("upgrade", async (request, socket: Socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const docId = url.searchParams.get("docId");
  const token = url.searchParams.get("token");

  if (!docId || !token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  try {
    // Load document once connected to the websocket server
    await loadDocument(docId, docs);

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);

      // ws.on("message", () => {
      //   const currentDoc = getYDoc(docId);
      //   updateLastModified(currentDoc);
      // });
    });
  } catch (error) {
    console.error(`Error loading document ${docId}:`, error);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    socket.destroy();
  }
});

// Main application logic
async function main() {
  await createConnection();
  console.log("Connected to database");

  server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`Server running at '${CONFIG.host}' on port ${CONFIG.port}`);
  });

  const currentDocs = docs.size;
  console.log(`Loaded ${currentDocs} documents`);

  setInterval(() => saveSnapshots(docs), CONFIG.saveInterval);
  setInterval(clearInactiveDocs, CONFIG.inactiveThreshold);
}

main().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
