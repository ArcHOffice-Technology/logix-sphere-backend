import { Router } from 'express';
import cors from 'cors';
import { ArchFramework } from '@archoffice/archframework-logix-sphere/src/shortcuts/arch-framework';
import path from 'path';
import routerAuth from './router/RouterAuth';

const express = require('express');
const router = Router();
const app = express();
app.use(express.json());

// Libera o CORS para todas as origens
app.use(cors());

interface FrameworkInstance {
    getEnvInstance(file: string): Promise<void>;
    getLogInstance(): Promise<any>; 
}

(async () => {
    try {
        const frameworkInstance = ArchFramework.getFrameworkInstance(() => Promise.resolve());

        if (frameworkInstance) {
            console.log('Framework instance loaded');

            const filePath: string = path.resolve(__dirname, '../arch-dev-environment.json');
            const envInstance = await frameworkInstance.getEnvInstance(filePath);
            console.log('Environment loaded', envInstance);

            const log = await frameworkInstance.getLogInstance();
            if (!log) {
                console.error('Erro ao inicializar o log');
                return;
            }

            log.saveLog({
                message: "Framework e ambiente carregados com sucesso",
                level: "info",
                timestamp: new Date(),
                metadata: null
            }, "Log_Init_BackEnd");
        } else {
            console.error('Não foi possível criar a instância do ArchFramework');
        }
    } catch (error) {
        const frameworkInstance = ArchFramework.getFrameworkInstance(() => Promise.resolve());
        const log = frameworkInstance ? await frameworkInstance.getLogInstance() : null;

        const logMessage = {
            message: `Erro ao carregar a instância do framework: ${error}`,
            level: "error" as "info" | "warn" | "error",
            timestamp: new Date(),
            metadata: null
        };

        if (log) {
            log.saveLog(logMessage, "Log_Init_BackEnd");
        } else {
            console.error('Erro ao carregar a instância do framework e ao inicializar o log:', error);
            console.error(logMessage);
        }
    }
})();

app.use('/auth', routerAuth);

// Inicia o servidor na porta 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default router;
