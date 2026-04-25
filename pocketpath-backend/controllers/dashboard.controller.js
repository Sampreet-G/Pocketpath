import Transaction from '../models/Transaction.model.js';
import User from '../models/User.model.js';

// @desc    Get home dashboard data (balance, income, spent, saved, spend by category, recent txns, streak, tip)
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyTxns = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // ── Monthly income & expenses ─────────────────────────────
    let monthlyIncome  = 0;
    let totalSpent     = 0;
    const categoryMap  = {};

    for (const txn of monthlyTxns) {
      if (txn.type === 'income') {
        monthlyIncome += txn.amount;
      } else {
        totalSpent += txn.amount;
        categoryMap[txn.category] = (categoryMap[txn.category] || 0) + txn.amount;
      }
    }

    // Use profile's monthly income if no income transactions exist
    const effectiveIncome = monthlyIncome || user.monthlyIncome;
    const totalBalance    = effectiveIncome - totalSpent;
    const savingsRate     = effectiveIncome > 0
      ? Math.round(((effectiveIncome - totalSpent) / effectiveIncome) * 100)
      : 0;

    // ── Spend by category ─────────────────────────────────────
    const spendByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));

    // ── Recent transactions (last 5) ──────────────────────────
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // ── Smart tip (food overspend example from UI) ────────────
    const foodSpend = categoryMap['Food'] || 0;
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const prevFoodAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          category: 'Food',
          date: { $gte: prevMonthStart, $lte: prevMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const prevFoodSpend = prevFoodAgg[0]?.total || 0;

    let tip = null;
    if (prevFoodSpend > 0 && foodSpend > prevFoodSpend) {
      const pctIncrease = Math.round(((foodSpend - prevFoodSpend) / prevFoodSpend) * 100);
      tip = {
        category: 'Food',
        message: `Food spend up ${pctIncrease}% this month`,
        detail: `You've spent ₹${foodSpend.toLocaleString('en-IN')}. A ₹2,500/week limit could help save more.`,
      };
    }

    res.json({
      success: true,
      data: {
        totalBalance,
        monthlyIncome: effectiveIncome,
        totalSpent,
        savingsRate,
        streak: user.streak,
        spendByCategory,
        recentTransactions,
        tip,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
