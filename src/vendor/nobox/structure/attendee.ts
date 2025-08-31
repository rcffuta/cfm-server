import { Space, ReturnObject } from "nobox-client";
import { createRowSchema } from "../../config";

interface Attendee {
    email: string;
    username: string;
    AID: string;
}

export const AttendeeStructure: Space<Attendee> = {
    space: "Attendee",// + (process.env.NODE_ENV !== "production" ? "-test" : ""),
    description: "A Record Space for Attendees",
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
        AID: {
            description: "User's AID",
            required: true,
            type: String,
        },
    }
}

export const AttendeeModel = createRowSchema<Attendee>(AttendeeStructure);
export type AttendeeObject = ReturnObject<Attendee>;
