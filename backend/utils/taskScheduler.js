const cron = require('node-cron');
const { Op } = require('sequelize');
const Task = require('../models/Task.js');
const User = require('../models/User.js');
const {
  sendDeadlineReminderEmail,
  sendUrgentReminderEmail,
  sendFinalWarningEmail
} = require('./emailService.js');

// Helper function to get a date that is X days from today
// Returns the date as a string like "2026-06-01"
const getDateDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // Format as YYYY-MM-DD to match database DATEONLY format
  return date.toISOString().split('T')[0];
};

// This is the main function that checks all tasks and sends reminders
const checkDeadlinesAndNotify = async () => {
  try {
    console.log('Running deadline check:', new Date().toLocaleString());

    const today = getDateDaysFromNow(0);        // today's date
    const oneDayLater = getDateDaysFromNow(1);  // tomorrow
    const threeDaysLater = getDateDaysFromNow(3); // 3 days from now

    // Find all incomplete tasks - no point reminding about completed tasks
    const incompleteTasks = await Task.findAll({
      where: {
        status: { [Op.in]: ['To Do', 'In Progress'] },
        dueDate: { [Op.in]: [today, oneDayLater, threeDaysLater] },
        assignedTo: { [Op.ne]: null } // only tasks that are assigned to someone
      },
      // Also get the assigned user details so we can email them
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Loop through each task and send the appropriate reminder email
    for (const task of incompleteTasks) {
      // Skip if task has no assigned user
      if (!task.assignee) continue;

      const userName = task.assignee.name;
      const userEmail = task.assignee.email;

      if (task.dueDate === today) {
        // Deadline is TODAY - send final warning
        console.log(`Sending final warning to ${userEmail} for task: ${task.title}`);
        await sendFinalWarningEmail(userEmail, userName, task);

      } else if (task.dueDate === oneDayLater) {
        // Deadline is TOMORROW - send urgent reminder
        console.log(`Sending urgent reminder to ${userEmail} for task: ${task.title}`);
        await sendUrgentReminderEmail(userEmail, userName, task);

      } else if (task.dueDate === threeDaysLater) {
        // Deadline is in 3 DAYS - send gentle reminder
        console.log(`Sending 3-day reminder to ${userEmail} for task: ${task.title}`);
        await sendDeadlineReminderEmail(userEmail, userName, task);
      }
    }

    console.log(`Deadline check complete. Processed ${incompleteTasks.length} tasks.`);

  } catch (error) {
    console.error('Deadline check error:', error);
  }
};

// Start the scheduler
// This runs automatically every day at 8:00 AM
// Cron format: 'second minute hour day month weekday'
// '0 8 * * *' means: at minute 0, hour 8, every day
const startScheduler = () => {
  cron.schedule('0 8 * * *', () => {
    checkDeadlinesAndNotify();
  });
  console.log('Task deadline scheduler started - runs daily at 8:00 AM');
};

// We export both functions
// startScheduler is called from server.js when the server starts
// checkDeadlinesAndNotify is exported so we can test it manually via Postman
module.exports = { startScheduler, checkDeadlinesAndNotify };