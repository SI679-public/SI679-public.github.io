// In-memory stand-ins for the server, so the client runs before it is
// connected to anything. Once every function in src/api/ talks to the real
// server, nothing imports this file and it can be deleted.
//
// The names all end in "(sample)" so it is obvious on screen which data you
// are looking at.

import type { Order, Product, Role } from '../types.ts';

export const sampleProducts: Product[] = [
  {
    id: 'p1',
    modelName: 'Pour-Over Brewer (sample)',
    modelNumber: 'PO-200',
    manufacturer: 'Hario',
    color: 'White',
    price: 34.5,
    quantity: 12
  },
  {
    id: 'p2',
    modelName: '10-Cup Thermal Drip (sample)',
    modelNumber: 'TD-10',
    manufacturer: 'Bonavita',
    color: 'Black',
    price: 149.99,
    quantity: 4
  },
  {
    id: 'p3',
    modelName: 'Espresso Machine (sample)',
    modelNumber: 'BES-870',
    manufacturer: 'Breville',
    color: 'Silver',
    price: 599.95,
    quantity: 2
  },
  {
    id: 'p4',
    modelName: 'French Press, 8 Cup (sample)',
    modelNumber: 'FP-8',
    manufacturer: 'Bodum',
    color: 'Red',
    price: 39.0,
    quantity: 0
  },
  {
    id: 'p5',
    modelName: 'Cold Brew Maker (sample)',
    modelNumber: 'CB-1',
    manufacturer: 'OXO',
    color: 'Teal',
    price: 49.99,
    quantity: 20
  },
  {
    id: 'p6',
    modelName: 'Moka Pot, 6 Cup (sample)',
    modelNumber: 'MK-6',
    manufacturer: 'Bialetti',
    color: 'Silver/Black',
    price: 42.0,
    quantity: 9
  }
];

export const sampleUsers: { username: string; password: string; role: Role }[] =
  [
    { username: 'casey', password: 'casey-password', role: 'customer' },
    { username: 'staff', password: 'staff-password', role: 'staff' }
  ];

export const sampleOrders: Order[] = [
  {
    id: 'o1',
    customerUsername: 'casey',
    items: [
      {
        productId: 'p1',
        modelName: 'Pour-Over Brewer (sample)',
        quantity: 1,
        price: 34.5
      }
    ],
    total: 34.5,
    status: 'fulfilled',
    createdAt: '2026-10-28T15:12:00.000Z'
  },
  {
    id: 'o2',
    customerUsername: 'jordan',
    items: [
      {
        productId: 'p5',
        modelName: 'Cold Brew Maker (sample)',
        quantity: 2,
        price: 49.99
      },
      {
        productId: 'p6',
        modelName: 'Moka Pot, 6 Cup (sample)',
        quantity: 1,
        price: 42.0
      }
    ],
    total: 141.98,
    status: 'placed',
    createdAt: '2026-10-31T18:40:00.000Z'
  }
];

// Pretend each call takes a moment, the way a real request does, so the
// loading states show up.
export const delay = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 300));

let lastId = 100;
export const nextId = (prefix: string): string => `${prefix}${++lastId}`;
