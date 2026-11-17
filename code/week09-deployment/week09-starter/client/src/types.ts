// The shapes the client works with. Products and orders match the JSON the
// server sends back (the server may send extra fields; the client ignores
// them).

export type Role = 'customer' | 'staff';

export type User = {
  username: string;
  role: Role;
};

export type Product = {
  id: string;
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

export type OrderStatus = 'placed' | 'fulfilled';

// One line of an order. The name and price are copied in when the order is
// placed, so an order still reads correctly if the product changes later.
export type OrderItem = {
  productId: string;
  modelName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerUsername: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

// What the client sends to place an order: which products, and how many.
// Never prices -- the server decides those.
export type NewOrderItem = {
  productId: string;
  quantity: number;
};
