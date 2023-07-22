import { conflictError, notFoundError } from "@/errors";
import { fullRoomError } from "@/errors/full-room-error";
import bookingRepository from "@/repositories/booking-repository";
import ticketService from "../tickets-service";
import ticketsRepository from "@/repositories/tickets-repository";
import { ticketError } from "@/errors/ticket-error";


async function getBooking(userId: number){
    const booking = await bookingRepository.getBooking(userId)
    if (!booking) throw notFoundError()

    return booking
}

async function createBooking(roomId: number, userId: number) {
    const checkBooking = await bookingRepository.getBooking(userId)
    console.log(checkBooking)
    if( checkBooking ) throw conflictError('Booking already exists!')

    const ticket = await ticketService.getTicketByUserId(userId)
    const ticketWithType = await ticketsRepository.findTicketForBooking(ticket.enrollmentId)
    if( ticket.status !== 'PAID' || !ticketWithType.TicketType.includesHotel || ticketWithType.TicketType.isRemote){
        throw ticketError()
    }

    const room = await bookingRepository.getRoom(roomId)
    console.log(room)
    if(!room) throw notFoundError()
    if(room.capacity === 0) throw fullRoomError()

    await bookingRepository.createBooking(roomId, userId)

    const newRoomCapacity = room.capacity - 1
    await bookingRepository.changeRoomCapacity(roomId, newRoomCapacity )

    const booking = await bookingRepository.getBooking(userId)

    return booking.id
}

async function changeBooking(roomId: number, userId: number){
    const booking = await bookingRepository.getBooking(userId)
    if (!booking) throw notFoundError()
    if (booking.roomId === roomId) throw conflictError('User is already booked in this room')

    const room = await bookingRepository.getRoom(roomId)
    if(!room) throw notFoundError()
    if(room.capacity === 0) throw fullRoomError()

    await bookingRepository.updateBooking(roomId, booking.id)

    const oldRoomCapacity = booking.Room.capacity + 1
    await bookingRepository.changeRoomCapacity(booking.roomId, oldRoomCapacity )

    const newRoomCapacity = room.capacity - 1
    await bookingRepository.changeRoomCapacity(roomId, newRoomCapacity )

    return booking.id
}

const bookingServices = {
    getBooking,
    createBooking,
    changeBooking
}
export default bookingServices