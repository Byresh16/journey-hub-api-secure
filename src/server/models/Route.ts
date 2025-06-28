
import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  stops: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>({
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  stops: [{
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

export default mongoose.model<IRoute>('Route', RouteSchema);
