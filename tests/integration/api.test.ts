import request from 'supertest';
import { createApp } from '../../src/api/app';

describe('API Integration Tests', () => {
  const app = createApp();

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
    });
  });

  describe('POST /api/events', () => {
    it('should create a page view event', async () => {
      const event = {
        eventType: 'pageView',
        timestamp: new Date().toISOString(),
        sessionId: 'session_test_123',
        page: {
          url: 'https://example.com/test',
          title: 'Test Page',
        },
      };

      const response = await request(app)
        .post('/api/events')
        .send(event)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('eventType', 'pageView');
    });

    it('should create a click event', async () => {
      const event = {
        eventType: 'click',
        timestamp: new Date().toISOString(),
        sessionId: 'session_test_456',
        element: {
          id: 'test-button',
          text: 'Test Click',
          position: { x: 100, y: 200 },
        },
      };

      const response = await request(app)
        .post('/api/events')
        .send(event)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should create a custom event', async () => {
      const event = {
        eventType: 'custom',
        timestamp: new Date().toISOString(),
        sessionId: 'session_test_789',
        eventName: 'test_event',
        properties: {
          testKey: 'testValue',
        },
      };

      const response = await request(app)
        .post('/api/events')
        .send(event)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject invalid event', async () => {
      const invalidEvent = {
        eventType: 'pageView',
        // missing required fields
      };

      const response = await request(app)
        .post('/api/events')
        .send(invalidEvent)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject future timestamp', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const event = {
        eventType: 'pageView',
        timestamp: futureDate.toISOString(),
        sessionId: 'session_test',
        page: {
          url: 'https://example.com',
          title: 'Test',
        },
      };

      const response = await request(app)
        .post('/api/events')
        .send(event)
        .set('Content-Type', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/events', () => {
    it('should retrieve events', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter events by type', async () => {
      const response = await request(app).get('/api/events?eventType=pageView');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].eventType).toBe('pageView');
      }
    });

    it('should paginate results', async () => {
      const response = await request(app).get('/api/events?limit=5&offset=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should reject invalid query parameters', async () => {
      const response = await request(app).get('/api/events?limit=invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/events/statistics', () => {
    it('should return event statistics', async () => {
      const response = await request(app).get('/api/events/statistics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalEvents');
      expect(response.body.data).toHaveProperty('eventsByType');
      expect(response.body.data).toHaveProperty('uniqueUsers');
      expect(response.body.data).toHaveProperty('uniqueSessions');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
