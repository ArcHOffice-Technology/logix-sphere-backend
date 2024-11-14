
import { ILogMenssage } from '@archoffice/logix-sphere-framework/src/cross/Interface/ILogMenssage';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PasswordResetDTO } from '../DTO/PasswordResetDto';
import { UserLoginDTO } from '../DTO/UserLoginDTO';
import { UserRegisterDTO } from '../DTO/UserRegisterDTO';
import { userData } from '../models/userData';
import { FkService } from './FkService';

export class AuthService {

    private loginAttempts: { [email: string]: number } = {};
    private resetTokens: { [email: string]: { token: string; expires: Date } } = {};
    private fk: FkService;

    constructor(fkService: FkService) {
        this.fk = fkService;
    }

    async sendPasswordResetToken(email: string): Promise<string> {
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();
        const emailSend = await this.fk.getEmail();
        const env = await this.fk.getEnv('../../arch-dev-environment.json');

        const fromEmail = env.getValueEnv('GSUITE_USER_EMAIL')
        console.log(fromEmail);

        const user = await this.getUserID(sqlPostgrees, email);
        if (!user) {
            await this.logAttempt(log, email, '', 'warn', 'Tentativa de recuperação de senha para e-mail inexistente');
            return 'Usuário não encontrado.';
        }

        const optionsEmail ={
            to: email,
            subject:  "Teste de envio de e-mail",
            body :"Este é um e-mail de teste enviado através do ArchEmail.",
            email: fromEmail
        }
        
        const token = this.generateToken();
        const expires = new Date(Date.now() + 30 * 60 * 1000);
        this.resetTokens[email] = { token, expires };

        const emailSent = await emailSend.sendEmail(optionsEmail);
        if (emailSent) {
            await this.logAttempt(log, email, '', 'success', 'Token de recuperação de senha enviado com sucesso');
            return 'Token de recuperação de senha enviado com sucesso para o seu e-mail.';
        } else {
            await this.logAttempt(log, email, '', 'warn', 'Falha ao enviar o token de recuperação de senha');
            return 'Falha ao enviar o e-mail de recuperação de senha.';
        }
    }

    private generateToken(): string {
        return uuidv4(); 
    }

    async verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
        const tokenData = this.resetTokens[email];
        if (tokenData && tokenData.token === token && tokenData.expires > new Date()) {
            return true;
        }
        return false;
    }

    async resetPassword(resetData: PasswordResetDTO): Promise<string> {
        const { email, token, newPassword } = resetData;
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();

        if (!this.isPasswordValid(resetData.newPassword)) {
            return 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e ter no mínimo 8 caracteres.';
        }

        if (await this.verifyPasswordResetToken(email, token)) {

            const hashedPassword = await this.hashPassword(newPassword);
            await sqlPostgrees?.update('users', { password: hashedPassword }, { email });

            delete this.resetTokens[email];

            await this.logAttempt(log, email, '', 'success', 'Senha redefinida com sucesso');
            return 'Senha redefinida com sucesso.';
        } else {
            await this.logAttempt(log, email, '', 'warn', 'Token de recuperação de senha inválido ou expirado');
            return 'Token inválido ou expirado.';
        }
    }

    private isPasswordValid(password: string): boolean {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isMinLength = password.length >= 8;

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isMinLength;
    }

    async registerUser(userData: UserRegisterDTO): Promise<string> {
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();

        if (!this.isPasswordValid(userData.password)) {
            return 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e ter no mínimo 8 caracteres.';
        }

        const existingUser = await this.getUser(sqlPostgrees, userData.email);
        if (existingUser.length > 0) {
            await this.logAttempt(log, userData.email, '', 'warn', 'Tentativa de cadastro de e-mail já existente');
            return 'E-mail já cadastrado.';
        }

        const userId = await this.createUser(sqlPostgrees, userData);
        if (userId) {
            await this.logAttempt(log, userData.email, '', 'success', 'Usuário cadastrado com sucesso');
            return 'Usuário cadastrado com sucesso!';
        } else {
            await this.logAttempt(log, userData.email, '', 'warn', 'Falha no cadastro do usuário');
            return 'Falha ao cadastrar o usuário.';
        }
    }

    private async createUser(sqlPostgrees: any, userData: UserRegisterDTO): Promise<number | null> {
        const query = `
            INSERT INTO users (
                name, last_name, date_of_birth, user_type, email, password, active, 
                start_date, end_date, created_by, created_at, cost_model_id, user_type_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            ) RETURNING user_id;
        `;
        const hashedPassword = await this.hashPassword(userData.password);
        const createdAt = new Date().toISOString();
        const values = [
            userData.name,
            userData.lastName,
            userData.dateOfBirth,
            userData.userType,
            userData.email,
            hashedPassword,
            userData.active,
            userData.startDate,
            userData.endDate,
            userData.createdBy,
            createdAt,
            userData.costModelId,
            userData.userTypeId
            
        ];

        const result = await sqlPostgrees?.executeQuery(query, values);
        return result && result[0] ? result[0].user_id : null;
    }
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password,salt); 
    }

    async login(
        credentials: UserLoginDTO,
    ): Promise<string | undefined> {
        const { email, password, ipAddress, deviceInfo } = credentials;
        const sqlPostgresSecurity = await this.fk.getSecurity();
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();

        

        const idUser = await this.getUserID(sqlPostgrees, email);
        

        if (!idUser) {
            await this.logAttempt(log, email, ipAddress, 'warn', 'Usuário não encontrado');
            return 'Usuário não encontrado';
        }

        const token = await this.authenticateUser(sqlPostgresSecurity, sqlPostgrees, email, password, ipAddress, deviceInfo);
        if (!token) {
            return await this.handleFailedLogin(sqlPostgrees, log, email, ipAddress, deviceInfo, idUser);
        } else {
            const userArray = await this.getUser(sqlPostgrees, email);
            const user = userArray[0];
            await this.resetLoginAttempts(email);
            await this.logAttempt(log, email, ipAddress, 'success', 'Login bem-sucedido');
            await this.updateLoginActivity(sqlPostgrees, user.user_id, ipAddress, deviceInfo, true, null);
            return token;
        }
    }

    private async getUserID(sqlPostgrees: any, email: string): Promise<number | undefined> {
        const query = `SELECT * FROM users WHERE email = $1`;
        var result = await sqlPostgrees?.executeQuery(query, [email]) as userData[];

        return result[0]?.user_id;
    }

    private async getUser(sqlPostgrees: any, email: string): Promise<userData[]> {
        const query = `SELECT * FROM users WHERE email = $1`;
        return await sqlPostgrees?.executeQuery(query, [email]) as userData[];
    }

    private async authenticateUser(sqlPostgresSecurity: any, sqlPostgrees: any, email: string, password: string, ipAddress: string, deviceInfo: string): Promise<string | null> {
        const userArray = await this.getUser(sqlPostgrees, email);
        if (userArray === null  || userArray === undefined) {
            return null;
        }
        const user = userArray[0];

        if(user.active === false){
            return "Usuario bloqueado,  por favor reset a senha!";
        }else{
            if (!user) {
                return null;
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const login = { email: email, password: user.password };
                const token = await sqlPostgresSecurity?.getValidationLogin(login);
                return token;
            } else {
                return null;
            }
        }
    }

    private async handleFailedLogin(sqlPostgrees: any, log: any, email: string, ipAddress: string, deviceInfo: string, userId: number) {
        this.loginAttempts[email] = (this.loginAttempts[email] || 0) + 1;
        const remainingAttempts = 3 - this.loginAttempts[email];
        const failureReason = 'Senha incorreta';

        await this.logAttempt(log, email, ipAddress, 'warn', `Tentativa de login com senha incorreta`);
        await this.updateLoginActivity(sqlPostgrees, userId, ipAddress, deviceInfo, false, failureReason);

        if (this.loginAttempts[email] >= 3) {
            await this.lockUserAccount(sqlPostgrees, email);
            return 'Conta bloqueada após 3 tentativas incorretas.';
        } else {
            return `Tentativa de login incorreta. Você tem ${remainingAttempts} tentativas restantes.`;
        }
    }

    private async logAttempt(log: any, email: string, ipAddress: string, level: 'warn' | 'success', message: string) {
        const logMessage: ILogMenssage = {
            message: `Usuário: ${email}. ${message} do IP ${ipAddress}.`,
            level,
            timestamp: new Date(),
            metadata: null
        };
        await log?.saveLog(logMessage,"Logs - Login");
    }

    private async updateLoginActivity(sqlPostgrees: any, userId: number, ipAddress: string, deviceInfo: string, isSuccess: boolean, failureReason: string | null) {
        const activityData = {
            login_time: new Date(),
            ip_address: ipAddress,
            device_info: deviceInfo,
            is_successful: isSuccess,
            failure_reason: failureReason,
            updated_at: new Date()
        };
        await sqlPostgrees?.update('user_login_activities', activityData, { user_id: userId });
    }

    private async lockUserAccount(sqlPostgrees: any, email: string) {
        await sqlPostgrees?.update('users', { active: false }, { email });
    }

    private async resetLoginAttempts(email: string) {
        delete this.loginAttempts[email];
    }

}
