import mongoose from 'mongoose';

const reflectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The journal/reflection entry text
    content: {
      type: String,
      required: [true, 'Reflection content is required'],
      trim: true,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', 'stressed'],
      default: 'okay',
    },
    // Tags like "impulse buy", "saving win", "regret", etc.
    tags: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

reflectSchema.index({ user: 1, date: -1 });

export default mongoose.model('Reflect', reflectSchema);
