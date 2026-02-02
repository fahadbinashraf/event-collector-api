import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Database from '../src/database/connection';

dotenv.config();

const sampleEvents = [
  {
    eventType: 'pageView',
    userId: 'user_001',
    sessionId: 'session_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    rawData: {
      eventType: 'pageView',
      page: {
        url: 'https://nn.nl/insurance/car',
        title: 'Car Insurance - NN',
        referrer: 'https://google.com',
      },
      device: {
        screenResolution: '1920x1080',
      },
    },
  },
  {
    eventType: 'pageView',
    userId: 'user_001',
    sessionId: 'session_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
    rawData: {
      eventType: 'pageView',
      page: {
        url: 'https://nn.nl/insurance/car/quote',
        title: 'Get a Quote - NN',
        referrer: 'https://nn.nl/insurance/car',
      },
    },
  },
  {
    eventType: 'click',
    userId: 'user_001',
    sessionId: 'session_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    rawData: {
      eventType: 'click',
      element: {
        id: 'cta-button',
        text: 'Get Quote',
        position: { x: 500, y: 300 },
      },
      page: {
        url: 'https://nn.nl/insurance/car',
      },
    },
  },
  {
    eventType: 'custom',
    userId: 'user_002',
    sessionId: 'session_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    rawData: {
      eventType: 'custom',
      eventName: 'form_submitted',
      properties: {
        formId: 'insurance-quote-form',
        vehicleType: 'car',
        coverage: 'comprehensive',
      },
    },
  },
  {
    eventType: 'pageView',
    userId: 'user_003',
    sessionId: 'session_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    rawData: {
      eventType: 'pageView',
      page: {
        url: 'https://nn.nl/insurance/home',
        title: 'Home Insurance - NN',
      },
    },
  },
];

async function seed() {
  const db = Database.getInstance();

  try {
    await db.connect();
    console.log('Connected to database');

    const pool = db.getPool();

    // Clear existing data
    await pool.query('DELETE FROM events');
    console.log('Cleared existing events');

    // Insert sample events
    for (const event of sampleEvents) {
      const id = uuidv4();
      await pool.query(
        `INSERT INTO events (
          id, event_type, user_id, session_id, timestamp, 
          raw_data, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          event.eventType,
          event.userId,
          event.sessionId,
          event.timestamp,
          JSON.stringify(event.rawData),
          '192.168.1.1',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ]
      );
      console.log(`Inserted event: ${id} (${event.eventType})`);
    }

    // Display statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT event_type) as event_types,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM events
    `);

    console.log('\nDatabase seeded successfully!');
    console.log('Statistics:', stats.rows[0]);

    await db.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
