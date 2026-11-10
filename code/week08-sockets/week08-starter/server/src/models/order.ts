export type OrderStatus = 'placed' | 'fulfilled';

// One line of an order. The name and price are copied from the product when
// the order is placed, so the order still says what was paid even if the
// product changes later.
export type OrderItem = {
  productId: string;
  modelName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerId: string;
  customerUsername: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

// What the repository needs to create one: everything but the id.
export type NewOrder = {
  customerId: string;
  customerUsername: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

// What a customer sends: which products, and how many. Never prices --
// the server looks those up.
export type OrderRequestItem = {
  productId: string;
  quantity: number;
};
