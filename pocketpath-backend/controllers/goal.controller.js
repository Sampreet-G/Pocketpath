import Goal from '../models/Goal.model.js';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline, emoji } = req.body;
    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetAmount,
      savedAmount,
      deadline,
      emoji,
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a goal (add savings, edit details, mark complete)
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Auto-mark complete if savedAmount >= targetAmount
    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      await goal.save();
    }

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
