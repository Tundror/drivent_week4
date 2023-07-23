import { faker } from '@faker-js/faker';
import { prisma } from '@/config';
import { Booking, Room, Ticket, TicketStatus, TicketType } from '@prisma/client';

export async function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId,
        },
        include: {
            Room: true
        }
    })
}

export function buildCreateBookingReturn() {
    const booking: Booking & { Room: Room } = {
        id: parseInt(faker.random.numeric()),
        userId: parseInt(faker.random.numeric()),
        roomId: 1,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        Room: {
            id: 1,
            name: faker.random.numeric(),
            capacity: parseInt(faker.random.numeric()),
            hotelId: parseInt(faker.random.numeric()),
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
        }
    }

    return booking

}

export function buildTicketReturn(status: TicketStatus) {
    const ticket: Ticket = {
        id: parseInt(faker.random.numeric()),
        ticketTypeId: parseInt(faker.random.numeric()),
        enrollmentId: parseInt(faker.random.numeric()),
        status,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
    }
    return ticket
}

export function buildTicketTypeReturn(isRemote: boolean, includesHotel: boolean) {
    const ticketTypeId = parseInt(faker.random.numeric())
    const ticketType: Ticket & { TicketType: TicketType } = {
        id: parseInt(faker.random.numeric()),
        ticketTypeId,
        enrollmentId: parseInt(faker.random.numeric()),
        status: 'RESERVED',
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        TicketType: {
            id: ticketTypeId,
            name: faker.name.firstName(),
            price: parseInt(faker.random.numeric(3)),
            isRemote,
            includesHotel,
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
        }

    }
    return ticketType
}

export function buildRoomReturn(capacity: number) {
    const room: Room = {
        id: 1,
        name: faker.random.numeric(),
        capacity,
        hotelId: parseInt(faker.random.numeric()),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
    }
    return room
}
