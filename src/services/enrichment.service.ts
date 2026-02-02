import useragent from 'useragent';
import { Event, EnrichedEvent } from '../types/events';
import logger from '../utils/logger';

export class EnrichmentService {
  enrichEvent(event: Event, ipAddress?: string, userAgent?: string): EnrichedEvent {
    const enriched: EnrichedEvent = {
      ...event,
      metadata: {
        receivedAt: new Date().toISOString(),
        ipAddress,
      },
    };

    // Parse user agent if provided
    if (userAgent) {
      try {
        const agent = useragent.parse(userAgent);
        enriched.metadata.browser = {
          name: agent.family,
          version: agent.toVersion(),
          os: agent.os.toString(),
        };
      } catch (error) {
        logger.warn('Failed to parse user agent', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userAgent,
        });
      }
    }

    // Add geo data (mocked for POC - in production, use a geo-IP service)
    if (ipAddress) {
      enriched.metadata.geo = this.mockGeoData(ipAddress);
    }

    logger.debug('Event enriched', {
      eventType: event.eventType,
      hasGeo: !!enriched.metadata.geo,
      hasBrowser: !!enriched.metadata.browser,
    });

    return enriched;
  }

  private mockGeoData(ipAddress: string): { country?: string; city?: string } {
    // This is a mock implementation
    // In production, integrate with MaxMind GeoIP or similar service

    // For local IPs, return mock data
    if (ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.') || ipAddress === '::1') {
      return {
        country: 'Netherlands',
        city: 'Amsterdam',
      };
    }

    // For other IPs, return generic mock data
    return {
      country: 'Unknown',
      city: 'Unknown',
    };
  }

  validateTimestamp(timestamp: string): boolean {
    const eventTime = new Date(timestamp);
    const now = new Date();

    // Event should not be from the future (with 5 min tolerance for clock skew)
    if (eventTime.getTime() > now.getTime() + 5 * 60 * 1000) {
      return false;
    }

    // Event should not be older than 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (eventTime.getTime() < thirtyDaysAgo.getTime()) {
      return false;
    }

    return true;
  }
}
