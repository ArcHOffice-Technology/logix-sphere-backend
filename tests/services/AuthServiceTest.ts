import { AuthService } from '../../src/services/AuthService';
import { FkService } from '../../src/services/FkService';
import * as bcrypt from 'bcryptjs';
import { expect, jest } from '@jest/globals';
import { ArchSQLCore } from '@archoffice/archframework-logix-sphere/src/core/ArchSQLCore';
import { ArchLogCore } from '@archoffice/archframework-logix-sphere/src/core/ArchLogCore';
import { ArchSecurityCore } from '@archoffice/archframework-logix-sphere/src/core/ArchSecurityCore';
import { UserRegisterDTO } from '../../src/DTO/UserRegisterDto';
import { UserLoginDTO } from '../../src/DTO/UserLoginDto';

jest.mock('bcryptjs');
jest.mock('../../src/services/FkService');

describe('AuthService', () => {
    let authService: AuthService;
    let fkServiceMock: jest.Mocked<FkService>;
    let sqlMock: { executeQuery: jest.Mock<any>, update: jest.Mock<any> };
    let logMock: { saveLog: jest.Mock<any> };

    beforeEach(() => {
        // Cria instâncias mock para `FkService`, `SQL` e `Log`
        fkServiceMock = new FkService() as jest.Mocked<FkService>;

        // Configura os mocks
        sqlMock = { executeQuery: jest.fn(), update: jest.fn() };
        logMock = { saveLog: jest.fn() };

        // Define os retornos mockados de `getSQL` e `getLog`
        fkServiceMock.getSQL = jest.fn<() => Promise<ArchSQLCore | undefined>>().mockResolvedValue(sqlMock as any);
        fkServiceMock.getLog = jest.fn<() => Promise<ArchLogCore | undefined>>().mockResolvedValue(logMock as any);

        // Instancia o AuthService com o mock de FkService
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

        const login: UserLoginDTO ={
            email: 'existinguser@example.com',
            password: 'correctpassword'
        }

        const result = await authService.login(login, '127.0.0.1', 'Device XYZ');

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

        const login: UserLoginDTO ={
            email: 'existinguser@example.com',
            password: 'correctpassword'
        }

        const result = await authService.login(login, '127.0.0.1', 'Device XYZ');
        expect(result).toBe('Tentativa de login incorreta. Você tem 2 tentativas restantes.');
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Tentativa de login com senha incorreta')
            }),
            'Logs - Login'
        );
    });

    it('deve executar o login com sucesso e registrar um log de login bem-sucedido', async () => {
        // Mocka uma resposta de consulta SQL para retornar um usuário ativo com senha
        sqlMock.executeQuery.mockResolvedValueOnce([{ user_id: 1, active: true, password: 'hashedPassword' }]);

        // Mocka o bcrypt.compare para retornar true (senha correta)
        const bcryptCompareMock = jest.spyOn(bcrypt, 'compare') as jest.Mock<typeof bcrypt.compare>;
        (bcrypt.compare as jest.Mock<any>).mockResolvedValue(true);

        // Mocka o método getValidationLogin para retornar um token simulado
        fkServiceMock.getSecurity = jest.fn<() => Promise<ArchSecurityCore>>().mockResolvedValue({
            getValidationLogin: jest.fn<() => Promise<string>>().mockResolvedValue('fakeToken')
        } as unknown as ArchSecurityCore);

        const login: UserLoginDTO ={
            email: 'existinguser@example.com',
            password: 'correctpassword'
        }

        const result = await authService.login(login, '127.0.0.1', 'Device XYZ');

        // Confirma que bcrypt.compare foi chamado com a senha correta e a senha hashada
        expect(bcryptCompareMock).toHaveBeenCalledWith('correctpassword', 'hashedPassword');

        // Verifica se o resultado é o token esperado
        expect(result).toBe('fakeToken');

        // Verifica se um log de sucesso foi registrado
        expect(logMock.saveLog).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Login bem-sucedido')
            }),
            'Logs - Login'
        );

        // Limpa o mock para evitar interferência em outros testes
        bcryptCompareMock.mockRestore();
    });


});
