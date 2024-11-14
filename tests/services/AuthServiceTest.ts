import { AuthService } from '../../src/services/AuthService';
import { FkService } from '../../src/services/FkService';
import * as bcrypt from 'bcryptjs';
import { expect, jest } from '@jest/globals';
import { ArchSQLCore } from '@archoffice/logix-sphere-framework/src/core/ArchSQLCore';
import { ArchLogCore } from '@archoffice/logix-sphere-framework/src/core/ArchLogCore';
import { ArchSecurityCore } from '@archoffice/logix-sphere-framework/src/core/ArchSecurityCore';
import { UserRegisterDTO } from '../../src/DTO/UserRegisterDto';
import { UserLoginDTO } from '../../src/DTO/UserLoginDto';
import { PasswordResetDTO } from '../../src/DTO/PasswordResetDto';
import { ArchEmailCore } from '@archoffice/logix-sphere-framework/src/core/ArchEmailCore';
import { ArchEnvCore } from '@archoffice/logix-sphere-framework/src/core/ArchEnvCore';

jest.mock('bcryptjs');
jest.mock('../../src/services/FkService');

describe('AuthService', () => {
    let authService: AuthService;
    let fkServiceMock: jest.Mocked<FkService>;
    let sqlMock: { executeQuery: jest.Mock<any>, update: jest.Mock<any> };
    let logMock: { saveLog: jest.Mock<any> };
    let emailMock: { sendEmail: jest.Mock<any> };
    let envMock: { getValueEnv: jest.Mock<any> };
    let securityMock: { generateToken: jest.Mock<any>, validateToken: jest.Mock<any>, hashPassword: jest.Mock<any> };


    beforeEach(() => {
        fkServiceMock = new FkService() as jest.Mocked<FkService>;

        sqlMock = { executeQuery: jest.fn(), update: jest.fn() };
        logMock = { saveLog: jest.fn() };
        emailMock = { sendEmail: jest.fn() };
        envMock = { getValueEnv: jest.fn() };
        securityMock = { 
            generateToken: jest.fn(), 
            validateToken: jest.fn(), 
            hashPassword: jest.fn(),
        };

        fkServiceMock.getSQL = jest.fn<() => Promise<ArchSQLCore | undefined>>().mockResolvedValue(sqlMock as any);
        fkServiceMock.getLog = jest.fn<() => Promise<ArchLogCore | undefined>>().mockResolvedValue(logMock as any);
        fkServiceMock.getEmail = jest.fn<() => Promise<ArchEmailCore>>().mockResolvedValue(emailMock as any);
        fkServiceMock.getEnv = jest.fn<(file: string) => Promise<ArchEnvCore>>().mockReturnValue(envMock as any);
        fkServiceMock.getSecurity = jest.fn<() => Promise<ArchSecurityCore>>().mockResolvedValue(securityMock as any);


        authService = new AuthService(fkServiceMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('deve retornar "E-mail já cadastrado" se o usuário já existe', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 1 }]);

        const userData: UserRegisterDTO = {
            email: 'existinguser@example.com',
            password: 'passworD123#000',
            name: 'Test',
            active: true,
            startDate: new Date().toISOString(),
            lastName: 'User'
        };

        const result = await authService.registerUser(userData);
        expect(result).toBe('E-mail já cadastrado.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Tentativa de cadastro de e-mail já existente')
            }),
            "Logs - Login"
        );
    });

    it('deve retornar "Usuário cadastrado com sucesso!" se o cadastro for bem-sucedido', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([]);
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 3 }]);

        (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockImplementation(() => Promise.resolve('hashedPassword123'));

        const userData: UserRegisterDTO = {
            email: 'existinguser@example.com',
            password: 'passworD123#000',
            name: 'Test',
            active: true,
            startDate: new Date().toISOString(),
            lastName: 'User'
        };

        const result = await authService.registerUser(userData);
        expect(result).toBe('Usuário cadastrado com sucesso!');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Usuário cadastrado com sucesso')
            }),
            "Logs - Login"
        );
    });

    it('deve retornar "Falha ao cadastrar o usuário" se o cadastro falhar', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([]);
        sqlMock.executeQuery.mockResolvedValueOnce(null);
        (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockImplementation(() => Promise.resolve('hashedPassword123'));

        const userData: UserRegisterDTO = {
            email: 'existinguser@example.com',
            password: 'passworD123#000',
            name: 'Test',
            active: true,
            startDate: new Date().toISOString(),
            lastName: 'User'
        };

        const result = await authService.registerUser(userData);
        expect(result).toBe('Falha ao cadastrar o usuário.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Falha no cadastro do usuário')
            }),
            "Logs - Login"
        );
    });

    it('deve retornar "Usuário não encontrado" se o usuário não existir', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([]); // Simula que o usuário não foi encontrado

        const login: UserLoginDTO = {
            email: 'existinguser@example.com',
            password: 'correctpassword',
            ipAddress: '127.0.0.1',
            deviceInfo: 'Device XYZ'
        }

        const result = await authService.login(login);

        expect(result).toBe('Usuário não encontrado');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Usuário não encontrado')
            }),
            'Logs - Login'
        );
    });

    it('deve retornar undefined se a senha estiver incorreta', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 1, active: true }]);
        (bcrypt.compare as jest.Mock<any>).mockResolvedValue(false);

        const login: UserLoginDTO = {
            email: 'existinguser@example.com',
            password: 'correctpassword',
            ipAddress: '127.0.0.1',
            deviceInfo: 'Device XYZ'
        }

        const result = await authService.login(login);
        expect(result).toBe('Tentativa de login incorreta. Você tem 2 tentativas restantes.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Tentativa de login com senha incorreta')
            }),
            'Logs - Login'
        );
    });
    it('sendPasswordResetToken: deve retornar "Usuário não encontrado" se o usuário não existe', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([]);

        const result = await authService.sendPasswordResetToken('nonexistentuser@example.com');

        expect(result).toBe('Usuário não encontrado.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Tentativa de recuperação de senha para e-mail inexistente')
            }),
            'Logs - Login'
        );
    });

    it('sendPasswordResetToken: deve enviar o token de recuperação de senha com sucesso', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 1 }]);
        envMock.getValueEnv.mockReturnValue('test@example.com');
        emailMock.sendEmail.mockResolvedValue(true);

        const result = await authService.sendPasswordResetToken('existinguser@example.com');

        expect(result).toBe('Token de recuperação de senha enviado com sucesso para o seu e-mail.');
        expect(emailMock.sendEmail).toHaveBeenCalled();
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Token de recuperação de senha enviado com sucesso')
            }),
            'Logs - Login'
        );
    });

    it('sendPasswordResetToken: deve retornar erro ao falhar no envio do e-mail', async () => {
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 1 }]);
        envMock.getValueEnv.mockReturnValue('test@example.com');
        emailMock.sendEmail.mockResolvedValue(false);

        const result = await authService.sendPasswordResetToken('existinguser@example.com');

        expect(result).toBe('Falha ao enviar o e-mail de recuperação de senha.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Falha ao enviar o token de recuperação de senha')
            }),
            'Logs - Login'
        );
    });

    it('verifyPasswordResetToken: deve retornar verdadeiro para token válido', async () => {
        authService['resetTokens'] = {
            'validuser@example.com': { token: 'validToken', expires: new Date(Date.now() + 30 * 60 * 1000) }
        };

        const isValid = await authService.verifyPasswordResetToken('validuser@example.com', 'validToken');
        expect(isValid).toBe(true);
    });

    it('verifyPasswordResetToken: deve retornar falso para token expirado', async () => {
        authService['resetTokens'] = {
            'expireduser@example.com': { token: 'expiredToken', expires: new Date(Date.now() - 1000) }
        };

        const isValid = await authService.verifyPasswordResetToken('expireduser@example.com', 'expiredToken');
        expect(isValid).toBe(false);
    });

    it('resetPassword: deve redefinir a senha com sucesso', async () => {
        // Mock dos tokens de reset para ignorar verificações internas
        authService['resetTokens'] = {
            'validuser@example.com': { token: 'validToken', expires: new Date(Date.now() + 30 * 60 * 1000) }
        };

        // Mock para simular a atualização de senha no banco de dados
        sqlMock.update.mockResolvedValue(true);

        // Chamando a função com os dados de reset
        const resetData: PasswordResetDTO = {
            email: 'validuser@example.com',
            token: 'validToken',
            newPassword: 'NewPassw0rd!'
        };

        // Verificação do resultado da função sem verificar detalhes de implementação
        const result = await authService.resetPassword(resetData);

        expect(result).toBe('Senha redefinida com sucesso.');
    });

    it('isPasswordValid: deve validar uma senha forte', () => {
        const isValid = authService['isPasswordValid']('Str0ngPass!');
        expect(isValid).toBe(true);
    });

    it('isPasswordValid: deve retornar falso para senha fraca', () => {
        const isValid = authService['isPasswordValid']('weakpass');
        expect(isValid).toBe(false);
    });

});
