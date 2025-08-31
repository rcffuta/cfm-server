import { Server } from "socket.io";
import { SocketGateway } from "./socket.gateway";

export class SocketModule {
  public static initialize(server: any) {
    const io = new Server(server, {
      cors: {
        origin: "*", // Change this to the frontend URL in production
        methods: ["GET", "POST"],
      },
    });

    new SocketGateway(io);
    return io;
  }
}
