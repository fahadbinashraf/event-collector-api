import { describe, it, expect } from 'vitest';
import {
  pageViewEventSchema,
  clickEventSchema,
  customEventSchema,
  eventQuerySchema,
} from '../../../src/validation/schemas';

describe('Validation Schemas', () => {
  describe('pageViewEventSchema', () => {
    it('should validate correct page view event', () => {
      const validEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        page: {
          url: 'https://example.com/page',
          title: 'Example Page',
        },
      };

      const result = pageViewEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        page: {
          url: 'not-a-url',
          title: 'Example Page',
        },
      };

      const result = pageViewEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        // missing sessionId and page
      };

      const result = pageViewEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should accept optional userId', () => {
      const validEvent = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        sessionId: 'session_123',
        page: {
          url: 'https://example.com',
          title: 'Example',
        },
      };

      const result = pageViewEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });

  describe('clickEventSchema', () => {
    it('should validate correct click event', () => {
      const validEvent = {
        eventType: 'click',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        element: {
          id: 'button-1',
          text: 'Click me',
          position: { x: 100, y: 200 },
        },
      };

      const result = clickEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should accept minimal click event', () => {
      const validEvent = {
        eventType: 'click',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        element: {},
      };

      const result = clickEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject negative position coordinates', () => {
      const invalidEvent = {
        eventType: 'click',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        element: {
          position: { x: -10, y: 200 },
        },
      };

      const result = clickEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('customEventSchema', () => {
    it('should validate correct custom event', () => {
      const validEvent = {
        eventType: 'custom',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        eventName: 'video_played',
        properties: {
          videoId: 'video_123',
          duration: 120,
        },
      };

      const result = customEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should accept custom event without properties', () => {
      const validEvent = {
        eventType: 'custom',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        eventName: 'button_clicked',
      };

      const result = customEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject empty event name', () => {
      const invalidEvent = {
        eventType: 'custom',
        timestamp: new Date().toISOString(),
        sessionId: 'session_123',
        eventName: '',
      };

      const result = customEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('eventQuerySchema', () => {
    it('should validate correct query parameters', () => {
      const validQuery = {
        eventType: 'pageView',
        userId: 'user_123',
        limit: '20',
        offset: '10',
      };

      const result = eventQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should apply default values', () => {
      const minimalQuery = {};

      const result = eventQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should reject limit > 100', () => {
      const invalidQuery = {
        limit: '150',
      };

      const result = eventQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const invalidQuery = {
        offset: '-5',
      };

      const result = eventQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});
