import { ILogMenssage } from '@archoffice/logix-sphere-framework/src/cross/Interface/ILogMenssage';
import { userData } from '../models/userData';
import { userCredential } from '../types/userCredential';
import { FkService } from './FkService';

export class AuthService {

    private loginAttempts: { [email: string]: number } = {};

    private fk: FkService;

    constructor(fkService: FkService) {
        this.fk = fkService;
    }

    async registerUser(userData: Omit<userData, 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();

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

    private async createUser(sqlPostgrees: any, userData: Omit<userData, 'user_id' | 'created_at' | 'updated_at'>): Promise<number | null> {
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
            userData.last_name || null,
            userData.date_of_birth || null,
            userData.user_type || null,
            userData.email,
            hashedPassword,
            userData.active,
            userData.start_date,
            userData.end_date || null,
            userData.created_by || null,
            createdAt,
            userData.cost_model_id || null,
            userData.user_type_id || null
        ];

        const result = await sqlPostgrees?.executeQuery(query, values);
        return result && result[0] ? result[0].user_id : null;
    }
    private async hashPassword(password: string): Promise<string> {
        // Implementação para hash da senha usando uma biblioteca como bcrypt
        // Exemplo: return bcrypt.hash(password, 10);
        return password; // Placeholder, substituir por lógica de hash
    }

    async login(
        email: string,
        password: string,
        ipAddress: string,
        deviceInfo: string
    ): Promise<string | undefined> {
        const sqlPostgresSecurity = await this.fk.getSecurity();
        const sqlPostgrees = await this.fk.getSQL();
        const log = await this.fk.getLog();

        const idUser = await this.getUserID(sqlPostgrees, email);
        

        if (!idUser) {
            await this.logAttempt(log, email, ipAddress, 'warn', 'Usuário não encontrado');
            return 'Usuário não encontrado';
        }

        const token = await this.authenticateUser(sqlPostgresSecurity, email, password);
        if (!token) {
            return await this.handleFailedLogin(sqlPostgrees, log, email, ipAddress, deviceInfo, idUser);
        } else {
            const userArray = await this.getUser(sqlPostgrees, email);
            const user = userArray[0];
            await this.resetLoginAttempts(email);
            await this.logAttempt(log, email, ipAddress, 'success', 'Login bem-sucedido');
            await this.updateLoginActivity(sqlPostgrees, user.user_id, ipAddress, deviceInfo, true, null);
            console.log("Token gerado:", token);
            return token;
        }
    }

    async getUserID(sqlPostgrees: any, email: string): Promise<number> {
        const query = `SELECT * FROM users WHERE email = $1`;
        var result = await sqlPostgrees?.executeQuery(query, [email]) as userData[];

        return result[0].user_id;
    }

    async getUser(sqlPostgrees: any, email: string): Promise<userData[]> {
        const query = `SELECT * FROM users WHERE email = $1`;
        return await sqlPostgrees?.executeQuery(query, [email]) as userData[];
    }

    async authenticateUser(sqlPostgresSecurity: any, email: string, password: string): Promise<string | null> {
        const login: userCredential = { username: email, password };
        return sqlPostgresSecurity?.getValidationLogin(login) || null;
    }

    async handleFailedLogin(sqlPostgrees: any, log: any, email: string, ipAddress: string, deviceInfo: string, userId: number) {
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

    async logAttempt(log: any, email: string, ipAddress: string, level: 'warn' | 'success', message: string) {
        const logMessage: ILogMenssage = {
            message: `Usuário: ${email}. ${message} do IP ${ipAddress}.`,
            level,
            timestamp: new Date(),
            metadata: null
        };
        await log?.saveLog(logMessage,"Logs - Login");
    }

    async updateLoginActivity(sqlPostgrees: any, userId: number, ipAddress: string, deviceInfo: string, isSuccess: boolean, failureReason: string | null) {
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

    async lockUserAccount(sqlPostgrees: any, email: string) {
        await sqlPostgrees?.update('users', { active: false }, { email });
    }

    async resetLoginAttempts(email: string) {
        delete this.loginAttempts[email];
    }

}
