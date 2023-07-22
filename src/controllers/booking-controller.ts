import { AuthenticatedRequest } from "@/middlewares";
import bookingServices from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";


export async function getBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;

    const booking = await bookingServices.getBooking(userId)
    return res.status(httpStatus.OK).send(booking)
}

export async function createBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req
    const { roomId } = req.body

    const bookingId = await bookingServices.createBooking(roomId, userId)
    return res.status(httpStatus.OK).json({ bookingId })
}

export async function changeBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req
    const { roomId } = req.body

    const bookingId = await bookingServices.changeBooking(roomId, userId)
    return res.status(httpStatus.OK).json({ bookingId })
}