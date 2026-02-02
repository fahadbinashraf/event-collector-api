import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Database from '../connection';
import { StoredEvent, EventQuery, PaginatedResponse } from '../../types/events';
import logger from '../../utils/logger';

interface DatabaseRow {
  id: string;
  event_type: string;
  user_id: string | null;
  session_id: string | null;
  timestamp: Date;
  raw_data: Record<string, unknown>;
  enriched_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
}

export class EventsRepository {
  private pool: Pool;

  constructor() {
    this.pool = Database.getInstance().getPool();
  }

  async createEvent(
    eventType: string,
    userId: string | undefined,
    sessionId: string | undefined,
    timestamp: Date,
    rawData: Record<string, unknown>,
    enrichedData?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<StoredEvent> {
    const id = uuidv4();
    const query = `
      INSERT INTO events (
        id, event_type, user_id, session_id, timestamp,
        raw_data, enriched_data, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [
        id,
        eventType,
        userId,
        sessionId,
        timestamp,
        JSON.stringify(rawData),
        enrichedData ? JSON.stringify(enrichedData) : null,
        ipAddress,
        userAgent,
      ]);

      logger.info('Event created', { eventId: id, eventType });
      return this.mapRowToEvent(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType,
      });
      throw error;
    }
  }

  async findEvents(query: EventQuery): Promise<PaginatedResponse<StoredEvent>> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      params.push(query.eventType);
    }

    if (query.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(query.userId);
    }

    if (query.sessionId) {
      conditions.push(`session_id = $${paramIndex++}`);
      params.push(query.sessionId);
    }

    if (query.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      params.push(query.startDate);
    }

    if (query.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      params.push(query.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    const dataQuery = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);

    return {
      data: dataResult.rows.map((row) => this.mapRowToEvent(row)),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async findEventById(id: string): Promise<StoredEvent | null> {
    const query = 'SELECT * FROM events WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToEvent(result.rows[0]);
    } catch (error) {
      logger.error('Failed to find event by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId: id,
      });
      throw error;
    }
  }

  async getStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    uniqueUsers: number;
    uniqueSessions: number;
  }> {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM events',
      byType: 'SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type',
      uniqueUsers: 'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE user_id IS NOT NULL',
      uniqueSessions: 'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE session_id IS NOT NULL',
    };

    try {
      const [totalResult, byTypeResult, usersResult, sessionsResult] = await Promise.all([
        this.pool.query(queries.total),
        this.pool.query(queries.byType),
        this.pool.query(queries.uniqueUsers),
        this.pool.query(queries.uniqueSessions),
      ]);

      const eventsByType: Record<string, number> = {};
      byTypeResult.rows.forEach((row) => {
        eventsByType[row.event_type] = parseInt(row.count, 10);
      });

      return {
        totalEvents: parseInt(totalResult.rows[0].count, 10),
        eventsByType,
        uniqueUsers: parseInt(usersResult.rows[0].count, 10),
        uniqueSessions: parseInt(sessionsResult.rows[0].count, 10),
      };
    } catch (error) {
      logger.error('Failed to get statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private mapRowToEvent(row: DatabaseRow): StoredEvent {
    return {
      id: row.id,
      eventType: row.event_type,
      userId: row.user_id ?? undefined,
      sessionId: row.session_id ?? undefined,
      timestamp: row.timestamp,
      rawData: row.raw_data,
      enrichedData: row.enriched_data ?? undefined,
      ipAddress: row.ip_address ?? undefined,
      userAgent: row.user_agent ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
