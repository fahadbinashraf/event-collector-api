import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { validateRequest, validateQuery } from '../middleware/validation.middleware';
import { eventSchema, eventQuerySchema } from '../../validation/schemas';

const router = Router();
const eventsController = new EventsController();

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Public
 */
router.post('/', validateRequest(eventSchema), eventsController.createEvent);

/**
 * @route   GET /api/events
 * @desc    Get events with optional filtering and pagination
 * @access  Public
 */
router.get('/', validateQuery(eventQuerySchema), eventsController.getEvents);

/**
 * @route   GET /api/events/statistics
 * @desc    Get event statistics
 * @access  Public
 */
router.get('/statistics', eventsController.getStatistics);

/**
 * @route   GET /api/events/:id
 * @desc    Get a specific event by ID
 * @access  Public
 */
router.get('/:id', eventsController.getEventById);

export default router;
