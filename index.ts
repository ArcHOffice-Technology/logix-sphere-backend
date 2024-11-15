import express from 'express';
import dotenv from 'dotenv';
import { operationsReportRouter } from './src/controllers/operationsReportController';
import { financialRouter } from './src/controllers/financialController';

dotenv.config();

const app = express();
app.use(express.json());

// Rotas
app.use('/api/operations', operationsReportRouter);
app.use('/api/financial', financialRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
