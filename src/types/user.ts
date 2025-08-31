export interface User {
    id: string;
    email: string;
    name: string;
    authToken?: string;
    raffleId?: number;
}


export interface UserData {
    userId: string;
    raffleId: number;
    email: string;
    name: string;
}
