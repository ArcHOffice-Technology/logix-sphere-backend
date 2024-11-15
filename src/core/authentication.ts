
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, environment.jwtSecret, { expiresIn: environment.jwtExpiresIn });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, environment.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
