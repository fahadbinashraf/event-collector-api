import { z } from 'zod';

// Common schemas
const timestampSchema = z.string().datetime();
const userIdSchema = z.string().min(1).max(255).optional();
const sessionIdSchema = z.string().min(1).max(255);

// Page View Event Schema
export const pageViewEventSchema = z.object({
  eventType: z.literal('pageView'),
  timestamp: timestampSchema,
  userId: userIdSchema,
  sessionId: sessionIdSchema,
  page: z.object({
    url: z.string().url(),
    title: z.string().min(1).max(500),
    referrer: z.string().url().optional(),
  }),
  device: z
    .object({
      userAgent: z.string().max(1000).optional(),
      screenResolution: z
        .string()
        .regex(/^\d+x\d+$/)
        .optional(),
    })
    .optional(),
});

// Click Event Schema
export const clickEventSchema = z.object({
  eventType: z.literal('click'),
  timestamp: timestampSchema,
  userId: userIdSchema,
  sessionId: sessionIdSchema,
  element: z.object({
    id: z.string().max(255).optional(),
    text: z.string().max(500).optional(),
    position: z
      .object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
      })
      .optional(),
  }),
  page: z
    .object({
      url: z.string().url(),
    })
    .optional(),
});

// Custom Event Schema
export const customEventSchema = z.object({
  eventType: z.literal('custom'),
  timestamp: timestampSchema,
  userId: userIdSchema,
  sessionId: sessionIdSchema,
  eventName: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
});

// Union of all event types
export const eventSchema = z.discriminatedUnion('eventType', [
  pageViewEventSchema,
  clickEventSchema,
  customEventSchema,
]);

// Query parameters schema
export const eventQuerySchema = z.object({
  eventType: z.enum(['pageView', 'click', 'custom']).optional(),
  userId: z.string().max(255).optional(),
  sessionId: z.string().max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// Type inference
export type PageViewEventInput = z.infer<typeof pageViewEventSchema>;
export type ClickEventInput = z.infer<typeof clickEventSchema>;
export type CustomEventInput = z.infer<typeof customEventSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
