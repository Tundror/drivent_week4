import Joi from 'joi';
import { CreateBookingBody } from '@/protocols';

export const bookingSchema = Joi.object<CreateBookingBody>({
  roomId: Joi.number().required(),
});