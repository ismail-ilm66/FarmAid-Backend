const cron = require("node-cron");

const subscriptionService = require("../app/subscription/subscription.service");
const userSubscription = require("../app/subscription/user_subscription.model");
const user = require("../app/user/user.model");

const checkExpiredUsers = async () => {
  try {
    // Get users with expired subscriptions
    const expiredUsers = await subscriptionService.getExpiredUsers();

    if (!expiredUsers.status || expiredUsers.users.length === 0) {
      console.log("No expired users found.");
      return;
    }

    // Prepare update and delete promises
    const updatePromises = expiredUsers.users.map((user) =>
      user.update({ isSubscribed: false })
    );

    const deletePromises = expiredUsers.users.map((user) =>
      userSubscription.destroy({ where: { userId: user.id } })
    );

    // Execute all updates and deletions in parallel
    await Promise.all([...updatePromises, ...deletePromises]);

    console.log("Expired users processed successfully.");
  } catch (error) {
    console.error("Error processing expired users:", error);
  }
};

cron.schedule("0 0 * * *", checkExpiredUsers, {
  scheduled: true,
});
