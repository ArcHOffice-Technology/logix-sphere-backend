import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { FkService } from '../services/FkService';
import { UserLoginDTO } from '../DTO/UserLoginDTO';
import { PasswordResetDTO } from '../DTO/PasswordResetDto';

export class AuthController {
    private authService: AuthService;

    constructor(fkService: FkService) {
        this.authService = new AuthService(fkService);
    }
    
    async sendPasswordResetToken(req: Request, res: Response): Promise<Response> {
        try {
            const email = req.body.email;
            const result = await this.authService.sendPasswordResetToken(email);

            if (result === 'Token de recuperação de senha enviado com sucesso para o seu e-mail.') {
                return res.status(200).json({ message: result });
            } else {
                return res.status(400).json({ message: result });
            }
        } catch (error) {
            console.error("Erro ao solicitar recuperação de senha:", error);
            return res.status(500).json({ message: 'Erro ao processar a solicitação de recuperação de senha.' });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { email, token, newPassword } = req.body as PasswordResetDTO;
            const result = await this.authService.resetPassword({ email, token, newPassword });

            if (result === 'Senha redefinida com sucesso.') {
                return res.status(200).json({ message: result });
            } else {
                return res.status(400).json({ message: result });
            }
        } catch (error) {
            console.error("Erro ao resetar senha:", error);
            return res.status(500).json({ message: 'Erro ao processar a redefinição de senha.' });
        }
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
            debugger;
            const login: UserLoginDTO = { email, password };
            const token = await this.authService.login(login, ipAddress, deviceInfo);

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
