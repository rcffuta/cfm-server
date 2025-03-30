
import { Server, Socket } from "socket.io";
import { LiveNobox } from "../../vendor/config";
import { MemberModel } from "../../vendor/nobox-live/structures/members";
import { GenerationModel, TenureModel } from "../../vendor/nobox-live/structures/tenure";
import { Generation } from "../../vendor/nobox-live/types";
import { AttendeeModel } from "../../vendor/nobox/structure/attendee";

type LevelProfile = {
  level: number | string;
  info: Generation,
  total: number
}

type RegisterStat = {
  total: number;
  levels: LevelProfile[]
}

type RegisterStatConfig = {
  [id: string]:LevelProfile
}

export class SocketGateway {
  private io: Server;

  stats: RegisterStat = {
    total: 0, levels:[]
  }

  statsConfig:RegisterStatConfig=  {
    "fresher": {
      level: 100,
      total: 0,
      info: {
        name:"100 Level",
      }
    }
  }

  constructor(io: Server) {
    this.io = io;
    this.setupListeners();

    TenureModel.findOne({
      isEnded: false
    })
    .then(async (tenure)=>{
      // console.dir(tenure.levels)

      const levelInfo = await GenerationModel.find();

      tenure.levels.forEach((each)=> {
        const info = levelInfo.find((e)=>e.id === each.generation);

        if (!info) return;

        this.statsConfig[each.generation] = {
          info,
          total: 0,
          level: each.label
        }
      })
    })
    // .then((data)=>{
    //   console.debug(this.statsConfig)
    // })
    .catch((e)=>console.error(e));
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

    // Oracle namespace
    const oracleNameSpace = this.io.of("/oracle");
    oracleNameSpace.on("connection", (socket: Socket) => {
        console.log(`User connected to /oracle: ${socket.id}`);


        socket.on("select", (msg: string) => {
            console.log(`[ORACLE] Received: ${msg}`);

            oracleNameSpace.emit("preparing", msg);
            const val = generateRandomNumberWithDigits(5);

            setTimeout(()=>{
                console.debug("Sending:", val);
                oracleNameSpace.emit("selection", val);
            }, 1500)
        });

        socket.on("reset", ()=>{
            console.debug("REset!")
            oracleNameSpace.emit("reset");
        })


        oracleNameSpace.on("disconnect", () => {
            console.log(`User disconnected from /chat: ${socket.id}`);
        });

    
    });


    const authNameSpace = this.io.of("/register");

    authNameSpace.on("connection", (socket: Socket) => {
        console.log(`User connected to /register: ${socket.id}`);

        socket.on("register:check", async (mail: string) => {
            console.log(`[ORACLE] Received check: ${mail}`);

            // setTimeout(()=>{
            //     // console.debug("Sending:", val);
            //   }, 1500)
            const mem = await MemberModel.findOne({email: mail});

            console.debug(mail, mem,)

            if (!mem) {
              authNameSpace.emit("register:check:error", mail);
              return
            }

            authNameSpace.emit("register:check:verify", mem);
            return;
        });
        socket.on("register", async ({username, email}: any) => {
            console.log(`[ORACLE] Received register: ${username}:${email}`);

            // TODO: GEN unique AID

            try {

              const user = await AttendeeModel.insertOne({
                email, username, AID: Date.now().toString().slice(1,5).toString(),
              });

              authNameSpace.emit("register:success", user);
            } catch(err:any) {
              authNameSpace.emit("register:error", err);
            }

        });

        authNameSpace.on("disconnect", () => {
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