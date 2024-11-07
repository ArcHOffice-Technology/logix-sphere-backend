import express from 'express';
import { AuthController } from '../controller/AuthController';
import { FkService } from '../services/FkService';

const routerAuth = express.Router();
const fkService = new FkService();
const authController = new AuthController(fkService);

// Rota para registro de usuário
routerAuth.post('/register', (req, res) => authController.registerUser(req, res));

// Rota para login de usuário
routerAuth.post('/login', (req, res) => authController.login(req, res));

export default routerAuth;
