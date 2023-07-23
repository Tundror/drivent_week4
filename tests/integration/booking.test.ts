import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createTicketTypeRemote, createPayment, createTicketTypeWithHotel, createHotel, createRoomWithHotelId } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';
import { createBooking } from '../factories/booking-factory';
import { any, number } from 'joi';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 if there is no booking found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`)

            expect(status).toEqual(httpStatus.NOT_FOUND);
        })

        it('should respond with status 200 and return info on booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const booking = await createBooking(createdRoom.id, user.id)

            const { status, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`)

            expect(status).toEqual(httpStatus.OK);
            expect(body).toEqual({
                id: booking.id,
                Room: {
                    id: createdRoom.id,
                    name: expect.any(String),
                    capacity: 3,
                    hotelId: createdHotel.id,
                    createdAt: createdRoom.createdAt.toISOString(),
                    updatedAt: createdRoom.updatedAt.toISOString(),
                }
            }
            )
        })

    })
})

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe('when token is valid', () => {
        it('should return status 409 if user already has booking',async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            await createBooking(createdRoom.id, user.id)

            const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id})

            expect(status).toBe(httpStatus.CONFLICT)
        })

        it('should return error 404 if no room is found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            await createRoomWithHotelId(createdHotel.id);

            const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: 0})

            expect(status).toBe(httpStatus.NOT_FOUND)
        })
        it('should return booking id and code 200 if everything ok', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const { status, body } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id})

            expect(status).toBe(httpStatus.OK)
            expect(body).toEqual({bookingId: expect.any(Number)})
        })

    })
})

describe('PUT /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 if there is no booking found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            

            const { status } = await server.put('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id})

            expect(status).toEqual(httpStatus.NOT_FOUND);
        })
        it('should respond with status 200 and booking Id if everything ok', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const booking = await createBooking(createdRoom.id, user.id)
            const createdRoom2 = await createRoomWithHotelId(createdHotel.id);
            

            const { status, body } = await server.put('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom2.id})

            expect(status).toEqual(httpStatus.OK);
            expect(body).toEqual({bookingId: expect.any(Number)})
        })
    })
})

// bookingRouter.put('/', authenticateToken, validateBody(bookingSchema), changeBooking)

    // checar booking atual do usuario OK
    // se nao achar, erro 404 OK
    // se roomId for igual ao roomId passado, conflict error (usuario esta tentando trocar booking para o mesmo quarto)

    // procurar quarto pelo roomId passado
    // se nao achar, erro 404
    // se encontrar e estiver cheia, erro 403

    // se tudo estiver correto, retorno status 200 e bookingId