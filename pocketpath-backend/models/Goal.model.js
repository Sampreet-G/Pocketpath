import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    emoji: {
      type: String,
      default: '🎯',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual: progress percentage
goalSchema.virtual('progress').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(Math.round((this.savedAmount / this.targetAmount) * 100), 100);
});

goalSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Goal', goalSchema);
