import Transaction from '../models/Transaction.model.js';
import Budget from '../models/Budget.model.js';

// @desc    Monthly spending trend (last 6 months)
// @route   GET /api/insights/trend
// @access  Private
export const getMonthlyTrend = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trend = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category-level breakdown for current month
// @route   GET /api/insights/categories
// @access  Private
export const getCategoryBreakdown = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Attach budget limits if set
    const budgets = await Budget.find({ user: req.user._id });
    const budgetMap = {};
    budgets.forEach((b) => (budgetMap[b.category] = b.limitAmount));

    const result = breakdown.map((item) => ({
      category: item._id,
      total: item.total,
      count: item.count,
      limit: budgetMap[item._id] || null,
      overLimit: budgetMap[item._id] ? item.total > budgetMap[item._id] : false,
    }));

    res.json({ success: true, breakdown: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get / set budgets (category limits)
// @route   GET /api/insights/budgets
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set budget for a category
// @route   POST /api/insights/budgets
// @access  Private
export const setBudget = async (req, res) => {
  try {
    const { category, limitAmount, period } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, period: period || 'monthly' },
      { limitAmount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
