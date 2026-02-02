export interface PageViewEvent {
  eventType: 'pageView';
  timestamp: string;
  userId?: string;
  sessionId: string;
  page: {
    url: string;
    title: string;
    referrer?: string;
  };
  device?: {
    userAgent?: string;
    screenResolution?: string;
  };
}

export interface ClickEvent {
  eventType: 'click';
  timestamp: string;
  userId?: string;
  sessionId: string;
  element: {
    id?: string;
    text?: string;
    position?: {
      x: number;
      y: number;
    };
  };
  page?: {
    url: string;
  };
}

export interface CustomEvent {
  eventType: 'custom';
  timestamp: string;
  userId?: string;
  sessionId: string;
  eventName: string;
  properties?: Record<string, unknown>;
}

export type Event = PageViewEvent | ClickEvent | CustomEvent;

export interface StoredEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  rawData: Record<string, unknown>;
  enrichedData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrichedEvent {
  event: Event;
  metadata: {
    receivedAt: string;
    ipAddress?: string;
    geo?: {
      country?: string;
      city?: string;
    };
    browser?: {
      name?: string;
      version?: string;
      os?: string;
    };
  };
}

export interface EventQuery {
  eventType?: string;
  userId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: boolean;
  };
}

export interface MetricsResponse {
  totalEvents: number;
  eventsByType: Record<string, number>;
  uniqueUsers: number;
  uniqueSessions: number;
  timestamp: string;
}
