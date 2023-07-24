import { conflictError, noBookingError, notFoundError } from "@/errors";
import { fullRoomError } from "@/errors/full-room-error";
import bookingRepository from "@/repositories/booking-repository";
import ticketService from "../tickets-service";
import ticketsRepository from "@/repositories/tickets-repository";
import { ticketError } from "@/errors/ticket-error";


async function getBooking(userId: number){
    const booking = await bookingRepository.getBooking(userId)
    if (!booking) throw notFoundError()

    const formattedReturn = {
        id: booking.id,
        Room: {
            id: booking.Room.id,
            name: booking.Room.name,
            capacity: booking.Room.capacity,
            hotelId: booking.Room.hotelId,
            createdAt: booking.Room.createdAt,
            updatedAt: booking.Room.updatedAt
        }
    }

    return formattedReturn
}

async function createBooking(roomId: number, userId: number) {
    const checkBooking = await bookingRepository.getBooking(userId)
    if( checkBooking ) throw conflictError('Booking already exists!')

    const ticket = await ticketService.getTicketByUserId(userId)
    const ticketWithType = await ticketsRepository.findTicketForBooking(ticket.enrollmentId)
    if( ticket.status !== 'PAID' || !ticketWithType.TicketType.includesHotel || ticketWithType.TicketType.isRemote){
        throw ticketError()
    }

    const room = await bookingRepository.getRoom(roomId)
    if(!room) throw notFoundError()
    
    const capacity = await bookingRepository.getBookingsOnRoom(roomId)
    if(capacity.length >= room.capacity) throw fullRoomError()

    await bookingRepository.createBooking(roomId, userId)

    const booking = await bookingRepository.getBooking(userId)

    return booking.id
}

async function changeBooking(roomId: number, userId: number){
    const booking = await bookingRepository.getBooking(userId)
    if (!booking) throw noBookingError('Found no booking for user')
    if (booking.roomId === roomId) throw conflictError('User is already booked in this room')

    const room = await bookingRepository.getRoom(roomId)
    if(!room) throw notFoundError()

    const capacity = await bookingRepository.getBookingsOnRoom(roomId)
    if(capacity.length >= room.capacity) throw fullRoomError()

    await bookingRepository.updateBooking(roomId, booking.id)

    return booking.id
}

const bookingServices = {
    getBooking,
    createBooking,
    changeBooking
}
export default bookingServices