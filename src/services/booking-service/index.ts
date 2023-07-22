import { notFoundError } from "@/errors";
import { fullRoomError } from "@/errors/full-room-error";
import bookingRepository from "@/repositories/booking-repository";
import ticketService from "../tickets-service";
import ticketsRepository from "@/repositories/tickets-repository";
import { ticketError } from "@/errors/ticket-error";


async function getBooking(userId: number){
    const booking = await bookingRepository.getBooking(userId)
    if (booking.length === 0) throw notFoundError()

    return booking
}

async function createBooking(roomId: number, userId: number) {
    const ticket = await ticketService.getTicketByUserId(userId)
    const ticketWithType = await ticketsRepository.findTicketForBooking(ticket.enrollmentId)
    if( ticket.status !== 'PAID' || !ticketWithType.TicketType.includesHotel || ticketWithType.TicketType.isRemote){
        throw ticketError()
    }

    const room = await bookingRepository.getRoom(roomId)
    if(!room) throw notFoundError()
    if(room.capacity === 0) throw fullRoomError()

    await bookingRepository.createBooking(roomId, userId)

    const newRoomCapacity = room.capacity - 1
    await bookingRepository.changeRoomCapacity(roomId, newRoomCapacity )

    const booking = await bookingRepository.getBooking(userId)

    return booking[0].id
}

const bookingServices = {
    getBooking,
    createBooking
}
export default bookingServices