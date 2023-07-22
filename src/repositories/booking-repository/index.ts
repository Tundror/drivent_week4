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
    return prisma.booking.findMany({
        where: {
            userId
        },
        include:{
            Room: true
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

async function changeRoomCapacity(roomId: number, newCapacity: number) {
    return prisma.room.update({
        where: {
            id: roomId
        },
        data: {
            capacity: newCapacity
        }
    });
}


const bookingRepository = {
    createBooking,
    getBooking,
    getRoom,
    changeRoomCapacity
}

export default bookingRepository