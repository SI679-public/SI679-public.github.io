// Fills your local database with what the client needs to be useful: a
// staff user, a customer, and some products. Safe to run more than once --
// it skips anything that's already there.
//
// Run with: npm run seed   (MongoDB must be running, as for npm run dev)
//
// For local development only -- a real app would never keep passwords in
// its code.
import bcrypt from 'bcryptjs';
import { connect, disconnect } from '../db/db.js';
import * as usersRepository from '../db/users-repository.js';
import * as productsRepository from '../db/products-repository.js';
import type { Role } from '../models/user.js';
import type { NewProduct } from '../models/product.js';

const users: { username: string; password: string; role: Role }[] = [
  { username: 'staff', password: 'staff-password', role: 'staff' },
  { username: 'casey', password: 'casey-password', role: 'customer' }
];

const products: NewProduct[] = [
  {
    modelName: '14 Cup Programmable Coffee Maker',
    modelNumber: '2143561',
    manufacturer: 'Mr. Coffee',
    color: 'Silver',
    price: 89.99,
    quantity: 12
  },
  {
    modelName: 'BrewSense 12 Cup Drip Coffee Maker',
    modelNumber: 'KF7150BK',
    manufacturer: 'Braun',
    color: 'Stainless Steel and Black',
    price: 129.95,
    quantity: 8
  },
  {
    modelName: '12-Cup Programmable Coffee Maker',
    modelNumber: 'MK-B-DCMzz1',
    manufacturer: 'REVOTRA',
    color: 'Silver/Black',
    price: 44.77,
    quantity: 3
  },
  {
    modelName: 'K-Mini Single Serve Coffee Maker',
    modelNumber: 'K-MINI',
    manufacturer: 'Keurig',
    color: 'Black',
    price: 79.99,
    quantity: 0
  },
  {
    modelName: 'Brew Express Cold Brew Maker',
    modelNumber: 'BE-CB1',
    manufacturer: 'Hamilton Beach',
    color: 'Teal',
    price: 59.95,
    quantity: 15
  },
  {
    modelName: 'Moka Express, 6 Cup',
    modelNumber: '06800',
    manufacturer: 'Bialetti',
    color: 'Silver',
    price: 39.99,
    quantity: 20
  }
];

await connect();

for (const user of users) {
  if (await usersRepository.findUserByUsername(user.username)) {
    console.log(`User "${user.username}" already exists -- skipped.`);
    continue;
  }
  await usersRepository.insertUser({
    username: user.username,
    hashedPassword: await bcrypt.hash(user.password, 11),
    role: user.role
  });
  console.log(`Created ${user.role} "${user.username}".`);
}

if ((await productsRepository.findAllProducts()).length > 0) {
  console.log('There are already products -- skipped.');
} else {
  for (const product of products) {
    await productsRepository.insertProduct(product);
  }
  console.log(`Created ${products.length} products.`);
}

await disconnect();
