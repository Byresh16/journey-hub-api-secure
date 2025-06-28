
import mongoose, { Document, Schema } from 'mongoose';

export interface IBus extends Document {
  busNumber: string;
  capacity: number;
  type: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  type: {
    type: String,
    enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'],
    required: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IBus>('Bus', BusSchema);
