import { Request, Response, NextFunction } from 'express';
import { EventProcessorService } from '../../services/event-processor.service';
import { Event, EventQuery } from '../../types/events';
import logger from '../../utils/logger';

export class EventsController {
  private readonly eventProcessor: EventProcessorService;

  constructor() {
    this.eventProcessor = new EventProcessorService();
  }

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event: Event = req.body;
      const ipAddress = (req.ip || req.socket.remoteAddress) as string;
      const userAgent = req.get('user-agent');

      const storedEvent = await this.eventProcessor.processEvent(event, ipAddress, userAgent);

      res.status(201).json({
        success: true,
        data: {
          id: storedEvent.id,
          eventType: storedEvent.eventType,
          timestamp: storedEvent.timestamp,
        },
      });
    } catch (error) {
      logger.error('Failed to create event', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: EventQuery = req.query;
      const result = await this.eventProcessor.getEvents(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Failed to retrieve events', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventProcessor.getEventById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      logger.error('Failed to retrieve event by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };

  getStatistics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.eventProcessor.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Failed to retrieve statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };
}
