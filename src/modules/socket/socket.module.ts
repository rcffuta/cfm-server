import { Server } from "socket.io";
import { SocketGateway } from "./socket.gateway";

export class SocketModule {
  public static initialize(server: any) {
    const io = new Server(server, {
      cors: { origin: "*" }, // Allow all origins (for testing)
    });

    new SocketGateway(io);
    return io;
  }
}
