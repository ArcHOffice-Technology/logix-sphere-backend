import { ArchSecurity } from 'FrameworkBAExpress'; // Usando ArchSecurity do FrameworkBAExpress
import { userRepository } from '../infra/userRepository';

export const userService = {
  async validateUserToken(token: string) {
    if (!ArchSecurity.isTokenValid(token)) {
      throw new Error('Invalid or expired token');
    }

    return ArchSecurity.decodeToken(token);
  },

  async getUserProfile(userId: number) {
    return await userRepository.findUserById(userId);
  },
};
