
import request from 'supertest';
import app from '../../index';
import { userService } from '../../src/services/userService';

jest.mock('../../src/services/userService');

describe('Login Controller', () => {
  it('should return a token on successful login', async () => {
    userService.login.mockResolvedValue('mocked-token');
    const response = await request(app).post('/api/login').send({ username: 'test', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mocked-token');
  });
  
  it('should return 400 if username or password is missing', async () => {
    const response = await request(app).post('/api/login').send({ username: '' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Username and password are required.' });
  });
});
