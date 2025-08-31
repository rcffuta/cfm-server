
import { Server, Socket } from "socket.io";
import { LiveNobox } from "../../vendor/config";
import { MemberModel } from "../../vendor/nobox-live/structures/members";
import { GenerationModel, TenureModel } from "../../vendor/nobox-live/structures/tenure";
import { Generation, GenerationObject, MemberObject } from "../../vendor/nobox-live/types";
import { AttendeeModel, AttendeeObject } from "../../vendor/nobox/structure/attendee";

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


const getRandomValue = <T>(arr: T[]): T => {
  if (arr.length === 0) throw new Error("Array cannot be empty");

  const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % arr.length;
  return arr[randomIndex];
};

const generateId = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};


export class SocketGateway {
    private io: Server;

    stats: RegisterStat = {
        total: 0, levels:[]
    }


    memo: {
        [email: string]: MemberObject
    } = {}

    members: {
        [id: string]: MemberObject
    } = {}

    levelsInfo: GenerationObject[] = [];

    statsConfig:RegisterStatConfig=  {
        "fresher": {
        level: 100,
        total: 0,
        info: {
            name:"100 Level",
        }
        }
    }

    attendee: AttendeeObject[] = [];



    constructor(io: Server) {
        this.io = io;
        this.setupListeners();

        TenureModel.findOne({
            isEnded: false
        })
        .then(async (tenure)=>{
        // console.dir(tenure.levels)

            const levelInfo = await GenerationModel.find();

            this.levelsInfo = levelInfo;

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


        this.reload();
        
    }


    private async getAttendeeInfo(email: string) {
        const cached = this.memo[email];

        let user, level;

        if (cached) {
            user = cached;
        } else {

            try {
                user = await MemberModel.findOne({email});
                this.memo[email] = user;
            } catch (err) {
                console.error("Error finding user");
                return null;
            }
        }
        
        if (user) {
            let lvl = this.levelsInfo.find(e=>e.id === user.level);


            const id = lvl?.id || "fresher";

            level = this.statsConfig[id];
        }

        
        return {user, level};

    }

    private reload() {
        AttendeeModel.find({}).then((all)=>{

            this.attendee = all;

        })
    }

    private async getAttendeeById(id:string) {
        
    }

    private async getParticipantsId(filter: { level?: string; gender?: string }) {
        // Extract filter values and normalize them
        const levelFilter = filter.level?.toLowerCase();
        const genderFilter = filter.gender?.toLowerCase();


        const list = await Promise.all(this.attendee.map(async (e) => {
            const data = await this.getAttendeeInfo(e.email);

            // console.debug(user, filter);
            if (!data) {
                console.log("No User found!")
                return e.AID;
            }

            const {user} = data;


            this.members[e.AID] = user as any;


            // Ensure level has a fallback
            const userLevel = user.level === "" ? "fresher" : user.level;
            const levelInfo = this.statsConfig[userLevel];

            // Level filtering
            if (!levelFilter && !genderFilter) return e.AID;

            const levelMatch = !levelFilter || levelFilter === "all" || levelFilter === levelInfo?.level;

            // Gender filtering
            const genderMatch = !genderFilter || genderFilter === "both" || user.gender.toLowerCase() === genderFilter;

            return levelMatch && genderMatch ? e.AID : null;
        }));

        return list.filter((id): id is string => id !== null);
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

            socket.on("select", async (filter: any) => {
                console.log(`[ORACLE] Received: ${JSON.stringify(filter)}`);

                oracleNameSpace.emit("preparing", filter);
                
                const participants = await this.getParticipantsId(filter);
                console.debug(JSON.stringify(participants));

                if (!participants || participants.length === 0) {
                    console.warn("No participants available for selection.");
                    oracleNameSpace.emit("selection:error", "No participants available");
                    return;
                }

                const val = getRandomValue<string>(participants);
                const user = this.members[val];

                setTimeout(() => {
                    console.debug("Sending:", val);
                    oracleNameSpace.emit("selection", val);

                    oracleNameSpace.emit("selection:details", user);
                }, 1000);
            });

            socket.on("reset", () => {
                console.debug("Reset!");
                oracleNameSpace.emit("reset");
            });

            socket.on("selection:details:show", (user:any) => {
                oracleNameSpace.emit("selection:details:show", user);
            });

            socket.on("disconnect", () => {
                console.log(`User disconnected from /oracle: ${socket.id}`);
            });
        });


        const authNameSpace = this.io.of("/register");

        const emitAttendeeStats = async () => {
        try {
            const totalAttendees = await AttendeeModel.find();

            let stats: RegisterStat = {
                total: 0,
                levels: []
            };

            // Process all attendees asynchronously
            const attendeeData = await Promise.all(
                    totalAttendees.map(async (val) => {
                        const data = await this.getAttendeeInfo(val.email);
                        return data;
                    })
                );

                // Create a map to track levels and their counts
                const levelMap: { [key: string]: LevelProfile } = {};

                    // Aggregate statistics
                for (const data of attendeeData) {
                    if (!data) continue;

                    const { user, level } = data;
                    const lvlInfo = level || this.statsConfig["fresher"];

                    if (!levelMap[lvlInfo.level]) {
                        levelMap[lvlInfo.level] = { ...lvlInfo, total: 0 };
                    }

                    levelMap[lvlInfo.level].total += 1;
                    stats.total += 1;
                }

                // Convert levelMap to an array
                stats.levels = Object.values(levelMap);

                console.log("[STATS] Emitting attendee statistics:", stats);
                authNameSpace.emit("attendee:stats", stats);

                setTimeout(()=>emitAttendeeStats(), 10000)
            } catch (error) {
                console.error("[ERROR] Failed to emit attendee stats:", error);
            }
        };


        authNameSpace.on("connection", (socket: Socket) => {
            console.log(`User connected to /register: ${socket.id}`);

            socket.on("register:check", async (mail: string) => {
                console.log(`[ORACLE] Received check: ${mail}`);

                const mem = await MemberModel.findOne({ email: mail });

                if (!mem) {
                    authNameSpace.emit("register:check:error", mail);
                    return;
                }

                authNameSpace.emit("register:check:verify", mem);
            });

            socket.on("register", async ({ username, email }: { username: string; email: string }) => {
                console.log(`[ORACLE] Received register: ${username}:${email}`);

                try {
                    // Check if user already exists
                    let user = await AttendeeModel.findOne({ email });

                    if (user) {
                        console.log(`[ORACLE] User already exists, signing in: ${email}`);
                        authNameSpace.emit("register:success", user);
                        return;
                    }

                    // Generate unique AID
                    let id: string = "";
                    let isUnique = false;

                    while (!isUnique) {
                        id = generateId();
                        const usr = await AttendeeModel.findOne({ AID: id });
                        if (!usr) isUnique = true;
                    }

                    // Register new user
                    let user_d = { email, username, AID: id };
                    const usd = await AttendeeModel.insertOne(user_d);

                    authNameSpace.emit("register:success", usd);
                    await emitAttendeeStats();
                } catch (err: any) {
                    authNameSpace.emit("register:error", err.message);
                }
            });

            emitAttendeeStats();
            // socket.on("attendee:stats:seek", async ()=>{
            // })

            

            // setInterval(async ()=>{
            //     await emitAttendeeStats();
            // }, 10000)

            socket.on("disconnect", () => {
                console.log(`User disconnected from /register: ${socket.id}`);
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