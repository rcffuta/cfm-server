import { WinnerDetails } from "./user";

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface AuthMessage extends WebSocketMessage {
  type: 'auth';
  email: string;
  authToken: string;
}

export interface IdentifyOracleMessage extends WebSocketMessage {
  type: 'identifyOracle';
}

export interface PickOneMessage extends WebSocketMessage {
  type: 'pickOne';
}

export interface ResetDrawMessage extends WebSocketMessage {
  type: 'resetDraw';
}

// Add more message types as needed

export interface RaffleState {
  isDrawing: boolean;
  currentWinner: WinnerDetails | null;
  participants: Set<number>;
}
