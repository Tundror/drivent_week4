import { prisma } from "@/config";

async function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId,
        }
    })
  }

async function getBooking(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId
        },
        include:{
            Room: true
        }
    })
}

async function getBookingsOnRoom(roomId: number) {
    return prisma.booking.findMany({
        where: {
            roomId
        }
    })
}

async function updateBooking(roomId: number, bookingId: number){
    return prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId
        }
    })
}

async function getRoom(roomId: number){
    return prisma.room.findFirst({
        where: {
            id: roomId
        }
    })
}


const bookingRepository = {
    createBooking,
    getBooking,
    getRoom,
    updateBooking,
    getBookingsOnRoom
}

export default bookingRepository