
import express from "express";
import { createServer } from "http";
import { SocketModule } from "./modules/socket/socket.module";

const app = express();
const server = createServer(app);

// Initialize WebSocket module
const io = SocketModule.initialize(server);

app.get("/", (req, res) => {
  res.send("Socket server is running!");
});


// IP: 192.168.31.233
const PORT = 3020;
const HOST = "0.0.0.0"; // Listen to all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
