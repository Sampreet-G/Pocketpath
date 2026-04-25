import Transaction from '../models/Transaction.model.js';
import User from '../models/User.model.js';
import updateStreak from '../utils/updateStreak.js';

// @desc    Get all transactions for current user (with optional filters)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 20, page = 1 } = req.query;

    const filter = { user: req.user._id };
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new transaction (expense or income)
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, merchant, note, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      merchant,
      note,
      date: date || Date.now(),
    });

    // Update day streak whenever user logs any transaction
    const user = await User.findById(req.user._id);
    await updateStreak(user);

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
