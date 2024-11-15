import express from 'express';
import { reportService } from '../services/reportService';
import { authMiddleware } from '../middleware/authMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

export const financialRouter = express.Router();

// Middleware de autenticação para todas as rotas
financialRouter.use(authMiddleware);

// Middleware de permissão para usuários específicos
financialRouter.use(permissionMiddleware('admin'));

financialRouter.get('/', async (req, res) => {
  try {
    const financialData = await reportService.getFinancialReport();
    res.json(financialData);
  } catch (error) {
    console.error('Error retrieving financial report:', error);
    res.status(500).json({ error: 'Failed to retrieve financial report' });
  }
});
