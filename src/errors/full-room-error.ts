import { ApplicationError } from '@/protocols';

export function fullRoomError(): ApplicationError {
  return {
    name: 'fullRoomError',
    message: 'Room is full',
  };
}