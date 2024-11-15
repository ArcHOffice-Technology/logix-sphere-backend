import { generateToken, verifyToken } from '../../src/core/authentication';

describe('Authentication', () => {
  const userId = 1;

  it('should generate and verify token', () => {
    const token = generateToken(userId);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(userId);
  });

  it('should throw error on invalid token', () => {
    expect(() => verifyToken('invalidToken')).toThrow('Invalid token');
  });
});
