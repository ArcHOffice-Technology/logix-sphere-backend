import { userRepository } from '../../src/infra/userRepository';
import { pool } from '../../src/infra/database';

jest.mock('../../src/infra/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('User Repository', () => {
  it('should find user by username', async () => {
    const mockUser = { id: 1, username: 'testUser', role: 'admin' };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const user = await userRepository.findUserByUsername('testUser');
    expect(user).toEqual(mockUser);
  });
});
