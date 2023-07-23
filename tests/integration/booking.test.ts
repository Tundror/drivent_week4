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
import { any } from 'joi';

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

// bookingRouter.get('/', authenticateToken, getBooking); OK

    // pegar o booking do usuario OK
    // receber erro 404 quando nao encontra um booking com o userId passado OK
    // se tudo estiver correto, retorno status 200 e formato especificado (id e room info) OK

// bookingRouter.post('/', authenticateToken, validateBody(bookingSchema), createBooking);

    // checar se usuario ja tem booking, caso tiver, conflict error

    // pegar ticket e ticket type do usuario.
    // se status for !== PAID, nao incluir hotel ou for remoto, retornar erro 403

    // pegar a room com o roomId passado
    // se nao encontrar, erro 404
    // se encontrar e estiver cheia, erro 403

    // se tudo estiver correto, retorno status 200 e bookingId

// bookingRouter.put('/', authenticateToken, validateBody(bookingSchema), changeBooking)

    // checar booking atual do usuario
    // se nao achar, erro 404
    // se roomId for igual ao roomId passado, conflict error (usuario esta tentando trocar booking para o mesmo quarto)

    // procurar quarto pelo roomId passado
    // se nao achar, erro 404
    // se encontrar e estiver cheia, erro 403

    // se tudo estiver correto, retorno status 200 e bookingId