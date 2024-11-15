
import { queryWithLog } from './database';
import { UserDTO } from '../dto/userDTO';

export const userRepository = {
  async findUserByUsername(username: string): Promise<UserDTO | null> {
    const result = await queryWithLog('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  async findUserById(userId: number): Promise<UserDTO | null> {
    const result = await queryWithLog('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }
};
