import mongoose from 'mongoose';

// Per-category weekly/monthly spending limit set by the user
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    limitAmount: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly',
    },
  },
  { timestamps: true }
);

// One budget per user per category per period
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
