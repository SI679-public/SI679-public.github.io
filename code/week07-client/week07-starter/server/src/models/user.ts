export type Role = 'customer' | 'staff';

// A user as the app stores it. hashedPassword never leaves the server.
export type User = {
  id: string;
  username: string;
  hashedPassword: string;
  role: Role;
};

// What the repository needs to create one: everything but the id.
export type NewUser = {
  username: string;
  hashedPassword: string;
  role: Role;
};

// A user as the outside world sees it.
export type PublicUser = {
  id: string;
  username: string;
  role: Role;
};
