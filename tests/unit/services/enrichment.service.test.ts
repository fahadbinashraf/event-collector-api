import { EnrichmentService } from '../../../src/services/enrichment.service';
import { PageViewEvent } from '../../../src/types/events';

describe('EnrichmentService', () => {
  let service: EnrichmentService;

  beforeEach(() => {
    service = new EnrichmentService();
  });

  describe('enrichEvent', () => {
    it('should enrich event with metadata', () => {
      const event: PageViewEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        page: {
          url: 'https://example.com',
          title: 'Example Page',
        },
      };

      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

      const enriched = service.enrichEvent(event, ipAddress, userAgent);

      expect(enriched.metadata).toBeDefined();
      expect(enriched.metadata.receivedAt).toBeDefined();
      expect(enriched.metadata.ipAddress).toBe(ipAddress);
      expect(enriched.metadata.browser).toBeDefined();
      expect(enriched.metadata.geo).toBeDefined();
    });

    it('should parse user agent correctly', () => {
      const event: PageViewEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        page: {
          url: 'https://example.com',
          title: 'Example Page',
        },
      };

      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
      const enriched = service.enrichEvent(event, undefined, userAgent);

      expect(enriched.metadata.browser?.name).toBeDefined();
      expect(enriched.metadata.browser?.os).toBeDefined();
    });

    it('should handle missing user agent gracefully', () => {
      const event: PageViewEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        page: {
          url: 'https://example.com',
          title: 'Example Page',
        },
      };

      const enriched = service.enrichEvent(event);

      expect(enriched.metadata).toBeDefined();
      expect(enriched.metadata.browser).toBeUndefined();
    });
  });

  describe('validateTimestamp', () => {
    it('should accept valid recent timestamp', () => {
      const timestamp = new Date().toISOString();
      const isValid = service.validateTimestamp(timestamp);
      expect(isValid).toBe(true);
    });

    it('should reject future timestamp', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
      const isValid = service.validateTimestamp(futureDate.toISOString());
      expect(isValid).toBe(false);
    });

    it('should reject old timestamp', () => {
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
      const isValid = service.validateTimestamp(oldDate.toISOString());
      expect(isValid).toBe(false);
    });

    it('should accept timestamp within 5 minute tolerance', () => {
      const slightlyFuture = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes in future
      const isValid = service.validateTimestamp(slightlyFuture.toISOString());
      expect(isValid).toBe(true);
    });
  });
});
