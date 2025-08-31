
import { MemberModel } from "../vendor/nobox-live/structures/members";
import { AttendeeModel, AttendeeObject as User } from "../vendor/nobox/structure/attendee";


function* raffleIdGenerator(): Generator<number> {
    const base = 100000 + Math.floor(Math.random() * 900000); // random 6-digit base
    let counter = 0;

    while (true) {
        // Spread out using a mix of increments
        const offset = Math.floor(Math.sin(counter) * 1000) + (counter * 137) % 1000;
        const id = (base + offset) % 900000 + 100000; // Keep within 6-digit range
        yield id;
        counter++;
    }
}



const raffleIdGen = raffleIdGenerator();


// These are stubs - you'll replace them with your actual implementations
export async function authenticateUser(email: string, authToken: string): Promise<User | null> {
  // Implement your actual authentication logic here
  // This should verify the email and token against your database
  // Return user object or null if authentication fails

  
    // Example implementation:
    const user = await getUserByEmail(email);
    if (user) {
        return user;
    }
    return null;
}

export async function getUserByEmail(email: string, username?: string): Promise<User | null> {
  // Implement your actual user lookup logic here
  // Return user object from database

    //   Check if user is registered
    const isRegistered = await AttendeeModel.findOne({email});

    if (isRegistered) {
        return isRegistered
    }

    const data = await MemberModel.findOne({email})

    if (!data) {
        return null;
    }

    const registeredUser = await AttendeeModel.insertOne({
        email: data.email,
        name: `${data.firstname} ${data.lastname}`,
        username: username ?? data.firstname,
    })

  return registeredUser;
//   return {
//     id: 'user-123',
//     email: email,
//     name: 'John Doe',
//     authToken: 'valid-token', // In reality, you'd validate this properly
//     raffleId: undefined // Will be assigned on first login
//   };
}

export async function assignRaffleId(userId: string): Promise<User> {
  // Implement your actual raffle ID assignment logic here
  // Store the raffleId in the database for this user

    let raffleId: number | null = null;

    do {
        const _id = raffleIdGen.next().value as number;

        const exist = await AttendeeModel.findOne({raffleId: _id});

        if (!exist) {
            raffleId = _id;
            break
        }

    } while(raffleId == null)

    const data = await AttendeeModel.updateOneById(userId, {
        raffleId
    })

    console.log(`Assigned raffle ID ${raffleId} to user ${userId}`);
    return data;
}

export async function getRaffleIdDetails(raffleId: number): Promise<User> {
    // Implement your actual raffle ID lookup logic here
    // Return user details associated with this raffle ID

    return await AttendeeModel.findOne({raffleId})
    // return {
    //     raffleId: raffleId,
    //     name: 'Winner Name',
    //     email: 'winner@example.com',
    //     // Add other relevant details
    // };
}



