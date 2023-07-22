import { ApplicationError } from '@/protocols';

export function ticketError(): ApplicationError {
  return {
    name: 'ticketError',
    message: 'Ticket is wrong',
  };
}