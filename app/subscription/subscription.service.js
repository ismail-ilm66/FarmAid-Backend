const { Op } = require("sequelize");
const { uploadToCloudinary } = require("../../utils");
const subscription = require("./subscription.model");
const userService = require("../user/user.service");
const userSubscription = require("./user_subscription.model");
const moment = require("moment");
const user = require("../user/user.model");

exports.createSubscription = async (subscriptionData) => {
  const subscriptionExists = await subscription.findOne({
    where: { planName: subscriptionData.planName.toLowerCase() },
  });

  if (subscriptionExists)
    return {
      code: 409,
      status: false,
      message: "This plan already exists",
    };

  const subscriptionCreated = await subscription.create({
    planName: subscriptionData.planName.toLowerCase(),
    duration: parseInt(subscriptionData.duration),
    planPrice: parseFloat(subscriptionData.planPrice),
    planPic:
      (await uploadToCloudinary(
        subscriptionData.planPic,
        "Bado/SubscriptionPics"
      )) ?? null,
  });

  return {
    code: 201,
    status: true,
    message: "Subscription Plan created successfully",
    subscription: subscriptionCreated,
  };
};

exports.updatePlan = async ({ subscriptionId, planData }) => {
  const subscriptionExists = await subscription.findByPk(subscriptionId);
  if (!subscriptionExists)
    return { code: 404, status: false, message: "Subscription Plan not found" };

  let { planName, planPrice, duration, planPic } = planData;

  if (planName) {
    //checking if the plan name already exists
    const planNameExists = await subscription.findOne({
      where: {
        planName: planName.toLowerCase(),
        id: { [Op.ne]: subscriptionId },
      },
    });
    if (planNameExists)
      return {
        code: 409,
        status: false,
        message: "This plan already exists",
      };
  }

  const updateBody = {
    ...(planName && { planName: planName.toLowerCase() }),
    ...(duration && { duration: parseInt(duration) }),
    ...(planPrice && { planPrice: parseFloat(planPrice) }),
    ...(planPic && {
      planPic:
        (await uploadToCloudinary(planPic, "Bado/SubscriptionPics")) ?? null,
    }),
  };

  await subscriptionExists.update(updateBody);

  return {
    code: 200,
    status: true,
    message: "Subscription Plan updated successfully",
    subscription: subscriptionExists,
  };
};

exports.deletePlan = async (subscriptionId) => {
  const subscriptionFound = await subscription.findByPk(subscriptionId);

  if (!subscriptionFound)
    return { code: 404, status: false, message: "Subscription Plan not found" };

  // Delete the user in the background
  setImmediate(async () => {
    try {
      await subscriptionFound.destroy();
      console.log(`Plan with ID ${subscriptionId} deleted successfully`);
    } catch (error) {
      console.error(
        `Error deleting Subscription plan with ID ${subscriptionId}:`,
        error
      );
    }
  });

  return {
    code: 200,
    status: true,
    message: "Subscription Plan Deleted Successfully",
  };
};

exports.getAllPlans = async () => {
  const allPlans = await subscription.findAll();

  if (allPlans.length === 0)
    return { code: 404, status: false, message: "No Subscription Plan found" };

  return {
    code: 200,
    status: true,
    message: "Subscription Plans fetched successfully",
    subscriptions: allPlans,
  };
};

exports.getPlanById = async ({ subscriptionId }) => {
  const subscriptionFound = await subscription.findByPk(subscriptionId);

  if (!subscriptionFound)
    return { code: 404, status: false, message: "Subscription Plan not found" };

  return {
    code: 200,
    status: true,
    message: "Subscription Plan fetched successfully",
    subscription: subscriptionFound,
  };
};

exports.subscribeUser = async ({ userId, subscriptionId }) => {
  //get the subscription plan
  const [subscriptionFound, userFound] = await Promise.all([
    this.getPlanById({ subscriptionId }),
    userService.findUserById({ userId }),
  ]);
  if (!subscriptionFound.status) return { ...subscriptionFound };
  if (!userFound.status) return { ...userFound };

  if (userFound?.user?.isSubscribed === true) {
    return { code: 409, status: false, message: "User is already subscribed" };
  }

  const [subscriptionData, userUpdated] = await Promise.all([
    userSubscription.create({
      userId,
      subscriptionId,
      startDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment().add(subscriptionFound?.subscription?.duration, "days"),
    }),
    userFound?.user?.update({ isSubscribed: 1 }),
  ]);

  return {
    code: 201,
    status: true,
    message: "User Subscribed Successfully",
    user: userFound?.user,
    subscription: subscriptionFound?.subscription,
    subscriptionData: subscriptionData,
  };
};

exports.getExpiredUsers = async () => {
  const expiredUsers = await userSubscription.findAll({
    where: {
      endDate: { [Op.lt]: moment().toDate() },
    },
    include: [user],
  });

  if (expiredUsers.length === 0)
    return {
      code: 404,
      status: false,
      message: "No expired users found",
      users: [],
    };

  const usersFetched = expiredUsers.map((subcribeUser) => subcribeUser?.user);

  return {
    code: 200,
    status: true,
    message: "Expired users fetched successfully",
    users: usersFetched,
  };
};
