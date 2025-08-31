
import dotenv from 'dotenv';
dotenv.config();
import { WebSocketServer, WebSocket } from 'ws';



import { 
  authenticateUser, 
  assignRaffleId, 
  getRaffleIdDetails 
} from './services/auth-service';
import { RaffleState, WebSocketMessage } from './types/raffle';
import { UserData } from './types/user';


// Store connected clients
const clients: {
    oracle: WebSocket | null;
    authenticated: Map<WebSocket, UserData>;
    unauthenticated: Set<WebSocket>;
} = {
    oracle: null,        // Remote control
    authenticated: new Map(),  // key: websocket, value: UserData
    unauthenticated: new Set() // Not yet authenticated clients
};

// Track raffle state
const raffleState: RaffleState = {
    isDrawing: false,
    currentWinner: null,
    participants: new Set()
};

// Generate numeric raffle IDs (efficient for large numbers)

const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });

wss.on('connection', function connection(ws: WebSocket) {
    console.log('New client connected');
    clients.unauthenticated.add(ws);
  
    ws.on('message', async function message(data: Buffer) {
        try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            console.log('Received message:', message.type);
      
            // Handle authentication first
            if (message.type === 'auth') {
                const { email, authToken } = message;
        
                try {
                    // Authenticate user (you'll implement the real function)
                    let user = await authenticateUser(email, authToken);
          
                    if (user) {
                        // Assign raffle ID if first login
                        if (!user.raffleId) {
                            user = await assignRaffleId(user.id);
                        }
            
                        // Move to authenticated clients
                        clients.unauthenticated.delete(ws);
                        clients.authenticated.set(ws, {
                            userId: user.id,
                            raffleId: user.raffleId as number,
                            email: user.email,
                            name: user.name
                        });
            
                        // Add to participants
                        raffleState.participants.add(user.raffleId as number);
            
                        // Send success response
                        ws.send(JSON.stringify({
                            type: 'authSuccess',
                            raffleId: user.raffleId,
                            user: { id: user.id, name: user.name, email: user.email }
                        }));
            
                        console.log(`User ${user.email} authenticated with raffle ID ${user.raffleId}`);
            
                        // Notify oracle about new participant
                        if (clients.oracle) {
                            clients.oracle.send(JSON.stringify({
                                type: 'participantJoined',
                                count: raffleState.participants.size
                            }));
                        }
                    } else {
                        // Authentication failed
                        ws.send(JSON.stringify({
                            type: 'authError',
                            message: 'Authentication failed'
                        }));
                    }
                } catch (error) {
                    console.error('Auth error:', (error as Error)?.message);
                    ws.send(JSON.stringify({
                        type: 'authError',
                        message: 'Authentication error'
                    }));
                }
                return;
            }
      
            // Handle logout
            if (message.type === 'logout') {
                if (clients.authenticated.has(ws)) {
                    const userData = clients.authenticated.get(ws) as UserData;
                    raffleState.participants.delete(userData.raffleId);
                    clients.authenticated.delete(ws);
            
                    ws.send(JSON.stringify({ type: 'logoutSuccess' }));
                    console.log(`User ${userData.email} logged out`);
                    
                    // Notify oracle
                    if (clients.oracle) {
                        clients.oracle.send(JSON.stringify({
                            type: 'participantLeft',
                            count: raffleState.participants.size
                        }));
                    }
                }
                return;
            }
      
            // Only authenticated users can send regular commands (except oracle or auth)
            const isOracle = clients.oracle === ws;
            const isAuthMessage = message.type === 'auth' || message.type === 'identifyOracle';

            if (!clients.authenticated.has(ws) && !isOracle && !isAuthMessage) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Not authenticated'
                }));
                return;
            }

      
            // Handle oracle connection
            if (message.type === 'identifyOracle') {
                clients.oracle = ws;
                console.log('Oracle remote control connected');
                
                // Send current state to oracle
                ws.send(JSON.stringify({
                    type: 'oracleState',
                    participantsCount: raffleState.participants.size,
                    isDrawing: raffleState.isDrawing,
                    currentWinner: raffleState.currentWinner
                }));
                return;
            }
      
            // Handle raffle draw commands from oracle
            if (clients.oracle === ws) {
                if (message.type === 'pickOne') {
                    if (raffleState.participants.size === 0) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'No participants available for drawing'
                        }));
                        return;
                    }
                    
                    if (raffleState.isDrawing) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Draw already in progress'
                        }));
                        return;
                    }
                
                    // Start the draw process
                    raffleState.isDrawing = true;
                
                    // Notify oracle that we're preparing
                    ws.send(JSON.stringify({
                        type: 'preparingDraw'
                    }));
                
                    // Convert participants set to array for random selection
                    const participantsArray = Array.from(raffleState.participants);
                
                    // Build suspense with multiple rapid "almost selections"
                    for (let i = 0; i < 10; i++) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        const randomIndex = Math.floor(Math.random() * participantsArray.length);
                        const almostWinner = participantsArray[randomIndex];
                        
                        ws.send(JSON.stringify({
                            type: 'suspense',
                            raffleId: almostWinner
                        }));
                    }
                
                    // Final delay for maximum suspense
                    await new Promise(resolve => setTimeout(resolve, 2000));
                
                    // Select the actual winner
                    const winnerIndex = Math.floor(Math.random() * participantsArray.length);
                    const winnerRaffleId = participantsArray[winnerIndex];
                
                    // Get winner details (you'll implement the real function)
                    const winnerDetails = await getRaffleIdDetails(winnerRaffleId);
                
                    // Update state
                    raffleState.isDrawing = false;
                    raffleState.currentWinner = winnerDetails;
                
                    // Notify oracle
                    ws.send(JSON.stringify({
                        type: 'winnerSelected',
                        winner: winnerDetails
                    }));
                
                    // Notify all participants
                    clients.authenticated.forEach((userData, clientWs) => {
                        if (clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify({
                                type: 'drawResult',
                                winner: winnerDetails,
                                isWinner: userData.raffleId === winnerRaffleId
                            }));
                        }
                    });
                
                    console.log(`Draw completed. Winner: ${winnerDetails.name} (${winnerRaffleId})`);
                }
                
                if (message.type === 'resetDraw') {
                    raffleState.isDrawing = false;
                    raffleState.currentWinner = null;
                    
                    // Notify oracle
                    ws.send(JSON.stringify({
                        type: 'drawReset'
                    }));
                
                    // Notify all participants
                    clients.authenticated.forEach((userData, clientWs) => {
                        if (clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(JSON.stringify({
                            type: 'drawReset'
                        }));
                        }
                    });
                
                    console.log('Draw has been reset');
                }
                
                return;
            }
      
            // Handle regular client messages
            switch (message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
                case 'getServerStatus':
                    ws.send(JSON.stringify({
                        type: 'serverStatus',
                        raffle: {
                            isDrawing: raffleState.isDrawing,
                            currentWinner: raffleState.currentWinner,
                            participantsCount: raffleState.participants.size
                        },
                        clients: {
                            total: wss.clients.size,
                            authenticated: clients.authenticated.size,
                            unauthenticated: clients.unauthenticated.size,
                            hasOracle: clients.oracle !== null
                        }
                    }));
                    break;
                default:
                    break;
                // Add other client message handlers here
            }
      
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
  
    ws.on('close', function() {
        // Remove client from appropriate list
        if (clients.unauthenticated.has(ws)) {
            clients.unauthenticated.delete(ws);
        } else if (clients.authenticated.has(ws)) {
            const userData = clients.authenticated.get(ws) as UserData;
            raffleState.participants.delete(userData.raffleId);
            clients.authenticated.delete(ws);
            console.log(`User ${userData.email} disconnected`);
        
            // Notify oracle
            if (clients.oracle) {
                clients.oracle.send(JSON.stringify({
                    type: 'participantLeft',
                    count: raffleState.participants.size
                }));
            }
        } else if (ws === clients.oracle) {
            clients.oracle = null;
            console.log('Oracle control disconnected');
        }
    });
  
    // Send authentication required message
    ws.send(JSON.stringify({
        type: 'authRequired'
    }));
});

console.log('Raffle WebSocket server running on port 8080');

// Clean up intervals and timeouts on shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    wss.close();
    process.exit(0);
});