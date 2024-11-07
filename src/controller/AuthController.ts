import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { FkService } from '../services/FkService';

export class AuthController {
    private authService: AuthService;

    constructor(fkService: FkService) {
        this.authService = new AuthService(fkService);
    }

    async registerUser(req: Request, res: Response): Promise<Response> {
        try {
            const userData = req.body;
            const result = await this.authService.registerUser(userData);
            if (result === 'Usuário cadastrado com sucesso!') {
                return res.status(201).json({ message: result });
            } else {
                return res.status(400).json({ message: result });
            }
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            return res.status(500).json({ message: 'Erro ao processar o cadastro do usuário.' });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password, ipAddress, deviceInfo } = req.body;
            const token = await this.authService.login(email, password, ipAddress, deviceInfo);
            
            if (token) {
                return res.status(200).json({ token });
            } else {
                return res.status(401).json({ message: 'Login falhou. Verifique suas credenciais.' });
            }
        } catch (error) {
            console.error("Erro ao realizar login:", error);
            return res.status(500).json({ message: 'Erro ao processar o login do usuário.' });
        }
    }
}
