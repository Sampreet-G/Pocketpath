import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, monthlyIncome, currency, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, monthlyIncome, currency, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
