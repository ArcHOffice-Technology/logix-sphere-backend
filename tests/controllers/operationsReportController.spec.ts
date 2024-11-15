import request from 'supertest';
import app from '../../index';
import { reportService } from '../../src/services/reportService';

jest.mock('../../src/services/reportService');

describe('Operations Report Controller', () => {
  test('GET /api/operations - should retrieve operations report', async () => {
    reportService.getOperationsReport.mockResolvedValue([{ deposit: 'Sample' }]);

    const response = await request(app).get('/api/operations');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ deposit: 'Sample' }]);
  });

  test('GET /api/operations/download-spreadsheet - should download Spreadsheet report', async () => {
    reportService.generateSpreadsheetReport.mockResolvedValue('spreadsheet,data');

    const response = await request(app).get('/api/operations/download-spreadsheet').query({ date: '2024-01-01' });
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('text/csv');
    expect(response.header['content-disposition']).toContain('attachment');
    expect(response.text).toBe('spreadsheet,data');
  });

  test('GET /api/operations/download-spreadsheet - should return 400 if date is missing', async () => {
    const response = await request(app).get('/api/operations/download-spreadsheet');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Date is required for Spreadsheet download.' });
  });
});
