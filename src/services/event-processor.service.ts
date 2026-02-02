import { Event, StoredEvent, EventQuery, PaginatedResponse } from '../types/events';
import { EventsRepository } from '../database/repositories/events.repository';
import { EnrichmentService } from './enrichment.service';
import logger from '../utils/logger';

export class EventProcessorService {
  private repository: EventsRepository;
  private enrichmentService: EnrichmentService;

  constructor() {
    this.repository = new EventsRepository();
    this.enrichmentService = new EnrichmentService();
  }

  async processEvent(event: Event, ipAddress?: string, userAgent?: string): Promise<StoredEvent> {
    // Validate timestamp
    if (!this.enrichmentService.validateTimestamp(event.timestamp)) {
      logger.warn('Event timestamp out of acceptable range', {
        eventType: event.eventType,
        timestamp: event.timestamp,
      });
      throw new Error('Event timestamp is invalid or out of acceptable range');
    }

    // Enrich event with metadata
    const enrichedEvent = this.enrichmentService.enrichEvent(event, ipAddress, userAgent);

    // Store in database
    const storedEvent = await this.repository.createEvent(
      event.eventType,
      event.userId,
      event.sessionId,
      new Date(event.timestamp),
      event,
      enrichedEvent.metadata,
      ipAddress,
      userAgent
    );

    logger.info('Event processed successfully', {
      eventId: storedEvent.id,
      eventType: event.eventType,
      userId: event.userId,
      sessionId: event.sessionId,
    });

    return storedEvent;
  }

  async getEvents(query: EventQuery): Promise<PaginatedResponse<StoredEvent>> {
    logger.info('Retrieving events', { query });
    return await this.repository.findEvents(query);
  }

  async getEventById(id: string): Promise<StoredEvent | null> {
    logger.info('Retrieving event by ID', { eventId: id });
    return await this.repository.findEventById(id);
  }

  async getStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    uniqueUsers: number;
    uniqueSessions: number;
    timestamp: string;
  }> {
    logger.info('Retrieving event statistics');
    const stats = await this.repository.getStatistics();

    return {
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }
}
