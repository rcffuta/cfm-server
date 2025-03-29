import { Server, Socket } from "socket.io";

export class SocketGateway {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Listen for a message from the client
      socket.on("message", (msg: string) => {
        console.log(`Received message: ${msg}`);
        // this.io.emit("message", msg); // Broadcast to all clients
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    // Chat namespace
    const chatNamespace = this.io.of("/oracle");
    chatNamespace.on("connection", (socket: Socket) => {
        console.log(`User connected to /oracle: ${socket.id}`);


        socket.on("select", (msg: string) => {
            console.log(`[ORACLE] Received: ${msg}`);

            chatNamespace.emit("preparing", msg);

            setTimeout(()=>{
                const val = generateRandomNumberWithDigits(5);
                console.debug("Sending:", val);
                chatNamespace.emit("selection", val);
            }, 5000)
        });

        socket.on("reset", ()=>{
            console.debug("REset!")
            chatNamespace.emit("reset");
        })


        chatNamespace.on("disconnect", () => {
            console.log(`User disconnected from /chat: ${socket.id}`);
        });

    
    });
  }
}


export function generateRandomNumberWithDigits(digits: number): number {
  if (digits <= 0) {
    throw new Error('The number of digits must be a positive integer.');
  }

  // Calculate the minimum and maximum values based on the number of digits
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  // Generate and return a random number within the specified range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}