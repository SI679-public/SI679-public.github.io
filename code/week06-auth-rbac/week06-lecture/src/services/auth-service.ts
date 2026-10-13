// #region setup
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as usersRepository from '../db/users-repository.js';
import { getJwtSecret } from '../config.js';
import {
  AuthenticationError,
  ConflictError,
  ValidationError
} from '../errors.js';
import type { PublicUser } from '../models/user.js';

const SALT_ROUNDS = 11;
// #endregion setup

// #region register
export const registerUser = async (
  username: string,
  password: string
): Promise<PublicUser> => {
  if (!username || !password) {
    throw new ValidationError('username and password are required');
  }

  // 1. is the username free?
  const existing = await usersRepository.findUserByUsername(username);
  if (existing) {
    throw new ConflictError('That username is taken');
  }

  // 2. hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. save the user -- everyone who registers is a customer
  const user = await usersRepository.insertUser({
    username,
    hashedPassword,
    role: 'customer'
  });

  return { id: user.id, username: user.username, role: user.role };
};
// #endregion register

// #region login
export const logIn = async (
  username: string,
  password: string
): Promise<string> => {
  const user = await usersRepository.findUserByUsername(username);
  if (!user) {
    throw new AuthenticationError('Wrong username or password');
  }

  const matches = await bcrypt.compare(password, user.hashedPassword);
  if (!matches) {
    throw new AuthenticationError('Wrong username or password');
  }

  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
};
// #endregion login
