import { Space, ReturnObject } from "nobox-client";
import { createRowSchema } from "../../config";

interface Attendee {
    username: string;
    email: string;
    name: string;
    raffleId?: number;
}

export const AttendeeStructure: Space<Attendee> = {
    space: "AttendeeV2",// + (process.env.NODE_ENV !== "production" ? "-test" : ""),
    description: "A Record Space for Attendees CFM V2",
    structure: {
        email: {
            description: "User's Email",
            type: String,
            required: true
        },
        username: {
            description: "User's username",
            required: true,
            type: String,
        },
        raffleId: {
            description: "User's raffle Id",
            required: false,
            type: Number,
        },
        name: {
            description: "User's full name",
            required: true,
            type: String,
        },
    }
}

export const AttendeeModel = createRowSchema<Attendee>(AttendeeStructure);
export type AttendeeObject = ReturnObject<Attendee>;
