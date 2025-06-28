
import express from 'express';
import Bus from '../models/Bus';
import Route from '../models/Route';
import BusSchedule from '../models/BusSchedule';

const router = express.Router();

/**
 * @swagger
 * /api/admin/buses:
 *   post:
 *     summary: Add a new bus
 *     tags: [Admin - Bus Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busNumber
 *               - capacity
 *               - type
 *             properties:
 *               busNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [AC, Non-AC, Sleeper, Semi-Sleeper]
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Bus added successfully
 *       400:
 *         description: Bus already exists or validation error
 */
router.post('/buses', async (req, res) => {
  try {
    const { busNumber, capacity, type, amenities = [] } = req.body;

    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus with this number already exists' });
    }

    const bus = new Bus({ busNumber, capacity, type, amenities });
    await bus.save();

    res.status(201).json({ message: 'Bus added successfully', bus });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/admin/buses/{id}:
 *   put:
 *     summary: Update a bus
 *     tags: [Admin - Bus Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [AC, Non-AC, Sleeper, Semi-Sleeper]
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bus updated successfully
 *       404:
 *         description: Bus not found
 */
router.put('/buses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const bus = await Bus.findByIdAndUpdate(id, updateData, { new: true });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({ message: 'Bus updated successfully', bus });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/admin/routes:
 *   post:
 *     summary: Add a new route
 *     tags: [Admin - Route Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routeName
 *               - origin
 *               - destination
 *               - distance
 *               - duration
 *             properties:
 *               routeName:
 *                 type: string
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               distance:
 *                 type: number
 *               duration:
 *                 type: number
 *               stops:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Route added successfully
 */
router.post('/routes', async (req, res) => {
  try {
    const { routeName, origin, destination, distance, duration, stops = [] } = req.body;

    const route = new Route({ routeName, origin, destination, distance, duration, stops });
    await route.save();

    res.status(201).json({ message: 'Route added successfully', route });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/admin/routes/{id}:
 *   put:
 *     summary: Update a route
 *     tags: [Admin - Route Management]
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
 *         description: Route updated successfully
 *       404:
 *         description: Route not found
 */
router.put('/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const route = await Route.findByIdAndUpdate(id, updateData, { new: true });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route updated successfully', route });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/admin/schedules:
 *   post:
 *     summary: Create a bus schedule
 *     tags: [Admin - Schedule Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bus
 *               - route
 *               - departureTime
 *               - arrivalTime
 *               - price
 *               - date
 *             properties:
 *               bus:
 *                 type: string
 *               route:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Schedule created successfully
 */
router.post('/schedules', async (req, res) => {
  try {
    const { bus, route, departureTime, arrivalTime, price, date } = req.body;

    const busDoc = await Bus.findById(bus);
    if (!busDoc) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const schedule = new BusSchedule({
      bus,
      route,
      departureTime,
      arrivalTime,
      price,
      date,
      availableSeats: busDoc.capacity,
      bookedSeats: []
    });

    await schedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
