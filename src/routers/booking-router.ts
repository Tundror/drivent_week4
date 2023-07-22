import { Router } from 'express';
import { singInPost } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { signInSchema } from '@/schemas';
import { createBooking, getBooking } from '@/controllers/booking-controller';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

bookingRouter.get('/', authenticateToken, getBooking);
bookingRouter.post('/', authenticateToken, validateBody(bookingSchema), createBooking);

export { bookingRouter };
