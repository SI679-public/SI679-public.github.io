// Creates a staff user in your local database. Registration only ever makes
// customers, so this is the one way a staff account comes into being.
//
// Run with: npm run seed   (MongoDB must be running, as for npm run dev)
//
// For local development only -- a real app would never keep a password in
// its code.
import bcrypt from 'bcryptjs';
import { connect, disconnect } from '../db/db.js';
import * as usersRepository from '../db/users-repository.js';

const STAFF_USERNAME = 'staff';
const STAFF_PASSWORD = 'staff-password';

await connect();

const existing = await usersRepository.findUserByUsername(STAFF_USERNAME);
if (existing) {
  console.log(`"${STAFF_USERNAME}" already exists -- nothing to do.`);
} else {
  await usersRepository.insertUser({
    username: STAFF_USERNAME,
    hashedPassword: await bcrypt.hash(STAFF_PASSWORD, 11),
    role: 'staff'
  });
  console.log(`Created staff user "${STAFF_USERNAME}".`);
}

await disconnect();
