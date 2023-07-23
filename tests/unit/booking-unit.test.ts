import bookingRepository from "@/repositories/booking-repository"
import bookingServices from "@/services/booking-service";
import { Booking, Room, Ticket, TicketType } from "@prisma/client"
import { createTicket, createTicketType, createTicketTypeWithHotel } from "../factories";
import { buildCreateBookingReturn, buildRoomReturn, buildTicketReturn, buildTicketTypeReturn, createBooking } from "../factories/booking-factory";
import ticketsRepository from "@/repositories/tickets-repository";
import ticketService from "@/services/tickets-service";

type BookingMock = Omit<Booking, "userId" | "roomId" | "createdAt" | "updatedAt">;


describe('booking services unit tests', () => {
    describe('GET /booking unit tests', () => {
        it('should return a specific booking', async () => {
            const mockBooking: Booking & { Room: Room } = {
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
    describe('POST /booking unit tests', () => {
        it('should return error 403 when ticket status !== PAID', async () => {
            const mockTicket: Ticket = buildTicketReturn('RESERVED')
            const mockTicketType: Ticket & { TicketType: TicketType } = buildTicketTypeReturn(false, true)

            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)
            jest.spyOn(ticketService, "getTicketByUserId").mockResolvedValueOnce(mockTicket)
            jest.spyOn(ticketsRepository, "findTicketForBooking").mockResolvedValueOnce(mockTicketType)

            const promise = bookingServices.createBooking(1, 1)
            expect(promise).rejects.toEqual({
                name: 'ticketError',
                message: 'Ticket is wrong'
            })
        })
        it('should return error 403 when ticket type does not include hotel', async () => {
            // const mockBooking: Booking & { Room: Room } = buildCreateBookingReturn()
            const mockTicket: Ticket = buildTicketReturn('PAID')
            const mockTicketType: Ticket & { TicketType: TicketType } = buildTicketTypeReturn(false, false)

            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)
            jest.spyOn(ticketService, "getTicketByUserId").mockResolvedValueOnce(mockTicket)
            jest.spyOn(ticketsRepository, "findTicketForBooking").mockResolvedValueOnce(mockTicketType)

            const promise = bookingServices.createBooking(1, 1)
            expect(promise).rejects.toEqual({
                name: 'ticketError',
                message: 'Ticket is wrong'
            })
        })
        it('should return error 403 when ticket type is remote', async () => {
            const mockTicket: Ticket = buildTicketReturn('PAID')
            const mockTicketType: Ticket & { TicketType: TicketType } = buildTicketTypeReturn(true, true)

            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)
            jest.spyOn(ticketService, "getTicketByUserId").mockResolvedValueOnce(mockTicket)
            jest.spyOn(ticketsRepository, "findTicketForBooking").mockResolvedValueOnce(mockTicketType)

            const promise = bookingServices.createBooking(1, 1)
            expect(promise).rejects.toEqual({
                name: 'ticketError',
                message: 'Ticket is wrong'
            })
        })

        it('should return error 404 if no room is found', async () => {
            const mockTicket: Ticket = buildTicketReturn('PAID')
            const mockTicketType: Ticket & { TicketType: TicketType } = buildTicketTypeReturn(false, true)

            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)
            jest.spyOn(ticketService, "getTicketByUserId").mockResolvedValueOnce(mockTicket)
            jest.spyOn(ticketsRepository, "findTicketForBooking").mockResolvedValueOnce(mockTicketType)
            jest.spyOn(bookingRepository, "getRoom").mockResolvedValueOnce(null)

            const promise = bookingServices.createBooking(1, 1)
            expect(promise).rejects.toEqual({
                name: 'NotFoundError',
                message: 'No result for this search!'
            })
        })
        it('should return error 403 when room is full', () => {
            const mockTicket: Ticket = buildTicketReturn('PAID')
            const mockTicketType: Ticket & { TicketType: TicketType } = buildTicketTypeReturn(false, true)
            const mockRoom: Room = buildRoomReturn(0)

            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)
            jest.spyOn(ticketService, "getTicketByUserId").mockResolvedValueOnce(mockTicket)
            jest.spyOn(ticketsRepository, "findTicketForBooking").mockResolvedValueOnce(mockTicketType)
            jest.spyOn(bookingRepository, "getRoom").mockResolvedValueOnce(mockRoom)

            const promise = bookingServices.createBooking(1, 1)
            expect(promise).rejects.toEqual({
                name: 'fullRoomError',
                message: 'Room is full'
            })
        })
    })

    describe('PUT /booking unit tests', () => {
        it('should respond with status 404 if there is no booking found', () => {
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null)

            const promise = bookingServices.changeBooking(2, 1)
            expect(promise).rejects.toEqual({
                name: 'NotFoundError',
                message: 'No result for this search!'
            })
        })

        it('should return error 409 if trying to book same room', () => {
            const mockBooking: Booking & { Room: Room } = buildCreateBookingReturn()
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking)

            const promise = bookingServices.changeBooking(mockBooking.roomId, 1)
            expect(promise).rejects.toEqual({
                name: 'ConflictError',
                message: 'User is already booked in this room'
            })

        })

        it('should return error 404 if room not found', () => {
            const mockBooking: Booking & { Room: Room } = buildCreateBookingReturn()
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking)
            jest.spyOn(bookingRepository, "getRoom").mockResolvedValueOnce(null)
            const promise = bookingServices.changeBooking(2, 1)
            expect(promise).rejects.toEqual({
                name: 'NotFoundError',
                message: 'No result for this search!'
            })
        })
        it('should return error 403 if room is full', () => {
            const mockBooking: Booking & { Room: Room } = buildCreateBookingReturn()
            const mockRoom: Room = buildRoomReturn(0)
            jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking)
            jest.spyOn(bookingRepository, "getRoom").mockResolvedValueOnce(mockRoom)
            const promise = bookingServices.changeBooking(2, 1)
            expect(promise).rejects.toEqual({
                name: 'fullRoomError',
                message: 'Room is full'
            })
        })



    })

})

// bookingRouter.put('/', authenticateToken, validateBody(bookingSchema), changeBooking)

    // checar booking atual do usuario OK
    // se nao achar, erro 404 OK
    // se roomId for igual ao roomId passado, conflict error (usuario esta tentando trocar booking para o mesmo quarto) OK

    // procurar quarto pelo roomId passado OK
    // se nao achar, erro 404 OK
    // se encontrar e estiver cheia, erro 403 OK

    // se tudo estiver correto, retorno status 200 e bookingId