import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { changeBooking, createBooking, getBooking } from '@/controllers/booking-controller';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

bookingRouter.get('/', authenticateToken, getBooking);
bookingRouter.post('/', authenticateToken, validateBody(bookingSchema), createBooking);
bookingRouter.put('/',authenticateToken, validateBody(bookingSchema), changeBooking )

export { bookingRouter };
