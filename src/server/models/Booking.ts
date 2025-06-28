
import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  busSchedule: mongoose.Types.ObjectId;
  seatNumbers: number[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'refunded';
  bookingDate: Date;
  passengerDetails: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
  }[];
  paymentStatus: 'pending' | 'completed' | 'failed';
  cancellationDate?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busSchedule: {
    type: Schema.Types.ObjectId,
    ref: 'BusSchedule',
    required: true
  },
  seatNumbers: [{
    type: Number,
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'refunded'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  passengerDetails: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
