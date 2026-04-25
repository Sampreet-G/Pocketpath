/**
 * Updates the user's day streak when they log a transaction.
 * - Same day → no change (already tracked today)
 * - Yesterday → streak + 1
 * - Anything older → reset to 1
 */
const updateStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = user.lastTrackedDate ? new Date(user.lastTrackedDate) : null;

  if (last) {
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return; // already tracked today
    if (diffDays === 1) {
      user.streak += 1;
    } else {
      user.streak = 1; // broke the streak
    }
  } else {
    user.streak = 1; // first ever transaction
  }

  user.lastTrackedDate = today;
  await user.save();
};

export default updateStreak;
