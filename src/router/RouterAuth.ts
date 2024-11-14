import express from 'express';
import { AuthController } from '../controller/AuthController';
import { FkService } from '../services/FkService';

const routerAuth = express.Router();
const fkService = new FkService();
const authController = new AuthController(fkService);

routerAuth.post('/register', (req, res) => authController.registerUser(req, res));

routerAuth.post('/login', (req, res) => authController.login(req, res));

routerAuth.post('/send-password-reset-token', (req, res) => authController.sendPasswordResetToken(req, res));

routerAuth.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default routerAuth;
