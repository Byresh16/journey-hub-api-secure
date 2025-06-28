
import express from 'express';
import mongoose from 'mongoose';
import BusSchedule from '../models/BusSchedule';
import Booking from '../models/Booking';
import Bus from '../models/Bus';
import Route from '../models/Route';

const router = express.Router();

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     summary: Search available buses
 *     tags: [User - Bus Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available buses found
 *       404:
 *         description: No buses found
 */
router.get('/search', async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ message: 'Origin, destination, and date are required' });
    }

    const searchDate = new Date(date as string);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const routes = await Route.find({
      origin: { $regex: origin as string, $options: 'i' },
      destination: { $regex: destination as string, $options: 'i' },
      isActive: true
    });

    if (routes.length === 0) {
      return res.status(404).json({ message: 'No routes found for the specified origin and destination' });
    }

    const routeIds = routes.map(route => route._id);

    const schedules = await BusSchedule.find({
      route: { $in: routeIds },
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
      availableSeats: { $gt: 0 }
    })
    .populate('bus')
    .populate('route')
    .sort({ departureTime: 1 });

    res.json({ schedules });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/user/book:
 *   post:
 *     summary: Book a bus
 *     tags: [User - Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busScheduleId
 *               - seatNumbers
 *               - passengerDetails
 *             properties:
 *               busScheduleId:
 *                 type: string
 *               seatNumbers:
 *                 type: array
 *                 items:
 *                   type: number
 *               passengerDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     age:
 *                       type: number
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                     phone:
 *                       type: string
 *     responses:
 *       201:
 *         description: Booking confirmed
 *       400:
 *         description: Seats not available or validation error
 */
router.post('/book', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { busScheduleId, seatNumbers, passengerDetails } = req.body;
    const userId = (req as any).user._id;

    const schedule = await BusSchedule.findById(busScheduleId).session(session);
    if (!schedule) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bus schedule not found' });
    }

    // Check seat availability
    const unavailableSeats = seatNumbers.filter((seat: number) => schedule.bookedSeats.includes(seat));
    if (unavailableSeats.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Some seats are already booked', 
        unavailableSeats 
      });
    }

    if (schedule.availableSeats < seatNumbers.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const totalAmount = schedule.price * seatNumbers.length;

    const booking = new Booking({
      user: userId,
      busSchedule: busScheduleId,
      seatNumbers,
      totalAmount,
      passengerDetails,
      paymentStatus: 'completed' // Simplified for demo
    });

    await booking.save({ session });

    // Update schedule
    schedule.bookedSeats.push(...seatNumbers);
    schedule.availableSeats -= seatNumbers.length;
    await schedule.save({ session });

    await session.commitTransaction();

    res.status(201).json({ 
      message: 'Booking confirmed successfully', 
      booking: {
        id: booking._id,
        seatNumbers: booking.seatNumbers,
        totalAmount: booking.totalAmount,
        status: booking.status
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
});

/**
 * @swagger
 * /api/user/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [User - Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 */
router.get('/bookings', async (req, res) => {
  try {
    const userId = (req as any).user._id;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'busSchedule',
        populate: [
          { path: 'bus' },
          { path: 'route' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/user/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [User - Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.put('/bookings/:id/cancel', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const booking = await Booking.findOne({ _id: id, user: userId }).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    booking.refundAmount = booking.totalAmount * 0.8; // 80% refund
    await booking.save({ session });

    // Update schedule - make seats available again
    const schedule = await BusSchedule.findById(booking.busSchedule).session(session);
    if (schedule) {
      schedule.bookedSeats = schedule.bookedSeats.filter(
        seat => !booking.seatNumbers.includes(seat)
      );
      schedule.availableSeats += booking.seatNumbers.length;
      await schedule.save({ session });
    }

    await session.commitTransaction();

    res.json({ 
      message: 'Booking cancelled successfully', 
      refundAmount: booking.refundAmount 
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
});

export default router;
