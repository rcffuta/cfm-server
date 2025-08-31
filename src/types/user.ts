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

export interface WinnerDetails {
  raffleId: number;
  name: string;
  email: string;
  [key: string]: any; // Allow for additional properties
}