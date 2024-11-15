import express from 'express';
import { reportService } from '../services/reportService';
import { ArchSecurity } from 'FrameworkBAExpress'; // Importando módulo de segurança do FrameworkBAExpress
import { ArchLog } from 'FrameworkBAExpress'; // Importando módulo de log

export const operationsReportRouter = express.Router();

operationsReportRouter.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    ArchLog.logError('Authorization token missing', new Error('Unauthorized'));
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!ArchSecurity.isTokenValid(token)) {
    ArchLog.logError('Invalid token provided', new Error('Unauthorized'));
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = ArchSecurity.decodeToken(token);

  if (user.role !== 'admin') {
    ArchLog.logError('Access denied for non-admin user', new Error('Forbidden'));
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const data = await reportService.getOperationsReport();
    ArchLog.logInfo('Operations report retrieved successfully');
    res.json(data);
  } catch (error) {
    ArchLog.logError('Error retrieving operations report', error);
    res.status(500).json({ error: 'Failed to retrieve operations report' });
  }
});
