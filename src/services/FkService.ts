import { ArchFramework } from '@archoffice/logix-sphere-framework/src/shortcuts/arch-framework';

export class FkService {
    private framework: ArchFramework;

    constructor() {
        this.framework = ArchFramework.getFrameworkInstance(() => Promise.resolve());
    }

    public async getEnv(file: string) {
        return await this.framework.getEnvInstance(file); 
    }

    public async getLog() {
        return await this.framework.getLogInstance(); 
    }

    public async getSQL(){
        return await this.framework.getSQLInstance(); 
    }

    public async getSecurity() {
        return await this.framework.getSecurityInstance(); 
    }

    public async getEmail() {
        return await this.framework.getEmailInstance(); 
    }
}

export const fkService = new FkService(); 
