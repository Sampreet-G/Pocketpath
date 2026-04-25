import mongoose from 'mongoose';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Subscriptions',
  'Health',
  'Education',
  'Transfer',
  'Income',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
    },
    // e.g. "PhonePe", "Spotify", "Swiggy" — shown as the sub-label in UI
    merchant: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fast per-user date-range queries
transactionSchema.index({ user: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
