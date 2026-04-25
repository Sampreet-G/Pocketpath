import Reflect from '../models/Reflect.model.js';

// @desc    Get all reflections for user
// @route   GET /api/reflect
// @access  Private
export const getReflections = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Reflect.countDocuments({ user: req.user._id });
    const reflections = await Reflect.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, reflections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a reflection
// @route   POST /api/reflect
// @access  Private
export const addReflection = async (req, res) => {
  try {
    const { content, mood, tags, date } = req.body;
    const reflection = await Reflect.create({
      user: req.user._id,
      content,
      mood,
      tags,
      date: date || Date.now(),
    });
    res.status(201).json({ success: true, reflection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a reflection
// @route   PUT /api/reflect/:id
// @access  Private
export const updateReflection = async (req, res) => {
  try {
    const reflection = await Reflect.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reflection) {
      return res.status(404).json({ success: false, message: 'Reflection not found' });
    }
    res.json({ success: true, reflection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a reflection
// @route   DELETE /api/reflect/:id
// @access  Private
export const deleteReflection = async (req, res) => {
  try {
    const reflection = await Reflect.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!reflection) {
      return res.status(404).json({ success: false, message: 'Reflection not found' });
    }
    res.json({ success: true, message: 'Reflection deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
