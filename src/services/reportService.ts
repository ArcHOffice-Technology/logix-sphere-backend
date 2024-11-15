import { ArchCacheCore } from 'FrameworkBAExpress'; // Usando o módulo ArchCacheCore do FrameworkBAExpress
import { reportRepository } from '../infra/reportRepository';

export const reportService = {
  async getOperationsReport() {
    const cacheKey = 'operationsReport';

    if (ArchCacheCore.hasItem(cacheKey)) {
      return ArchCacheCore.getItem(cacheKey);
    }

    const data = await reportRepository.getOperationsReport();
    ArchCacheCore.setItem(cacheKey, data);
    return data;
  },
};
