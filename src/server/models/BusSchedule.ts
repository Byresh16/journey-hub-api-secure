
import mongoose, { Document, Schema } from 'mongoose';

export interface IBusSchedule extends Document {
  bus: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  availableSeats: number;
  bookedSeats: number[];
  date: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusScheduleSchema = new Schema<IBusSchedule>({
  bus: {
    type: Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  bookedSeats: [{
    type: Number
  }],
  date: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IBusSchedule>('BusSchedule', BusScheduleSchema);
