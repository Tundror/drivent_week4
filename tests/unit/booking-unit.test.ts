import bookingRepository from "@/repositories/booking-repository"
import bookingServices from "@/services/booking-service";
import { Booking, Room } from "@prisma/client"

type BookingMock = Omit<Booking, "userId" | "roomId" | "createdAt" | "updatedAt">;


describe('booking services unit tests', () => {
    it('should return a specific booking', async () => {
        const mockBooking: Booking & {Room: Room} = {
            id: 1,
            userId: 1,
            roomId: 1,
            createdAt: new Date("2023-07-21T23:10:06.812Z"),
            updatedAt: new Date("2023-07-21T23:10:06.812Z"),
                Room: {
                    id: 1,
                    name: "101",
                    capacity: 3,
                    hotelId: 1,
                    createdAt: new Date("2023-07-21T23:10:06.812Z"),
                    updatedAt: new Date("2023-07-21T23:10:06.812Z"),
                }
        }
        jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking)
        const booking = await bookingServices.getBooking(1)
        expect(booking).toEqual({
            id: mockBooking.id,
                Room: {
                    id: mockBooking.Room.id,
                    name: mockBooking.Room.name,
                    capacity: mockBooking.Room.capacity,
                    hotelId: mockBooking.Room.hotelId,
                    createdAt: mockBooking.Room.createdAt,
                    updatedAt: mockBooking.Room.updatedAt,
                }
        })
    })
})