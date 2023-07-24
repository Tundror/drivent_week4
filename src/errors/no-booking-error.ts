import { ApplicationError } from '@/protocols';

export function noBookingError(message: string): ApplicationError {
  return {
    name: 'NoBookingError',
    message,
  };
}