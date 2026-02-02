import { Request, Response } from 'express';
import Database from '../../database/connection';
import { HealthCheckResponse } from '../../types/events';

export class HealthController {
  async healthCheck(req: Request, res: Response) {
    const startTime = Date.now();
    const db = Database.getInstance();
    const dbHealthy = await db.healthCheck();

    const response: HealthCheckResponse = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealthy,
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    const responseTime = Date.now() - startTime;

    res.status(statusCode).json({
      ...response,
      responseTime: `${responseTime}ms`,
    });
  }
}
