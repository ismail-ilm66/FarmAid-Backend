const subscriptionService = require("./subscription.service");

exports.addSubscriptionPlan = async (req, res) => {
  const subscriptionData = ({ planName, duration, planPrice } = req.body);
  const planPic = req?.file ?? null;

  if (
    !subscriptionData.planName ||
    !subscriptionData.planPrice ||
    !subscriptionData.duration ||
    !planPic
  )
    return res.status(400).json({
      code: 400,
      status: false,
      message: "planName, planPrice, duration and planPic are required",
    });

  subscriptionData.planPic = planPic;

  try {
    const subscriptionPlanCreated =
      await subscriptionService.createSubscription(subscriptionData);
    return res
      .status(subscriptionPlanCreated.code)
      .json(subscriptionPlanCreated);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllPlans = async (req, res) => {
  const { subscriptionId } = req.query;

  try {
    if (subscriptionId) {
      const planFetched = await subscriptionService.getPlanById({
        subscriptionId,
      });
      return res.status(planFetched.code).json(planFetched);
    }

    const allPlans = await subscriptionService.getAllPlans();
    return res.status(allPlans.code).json(allPlans);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  const { subscriptionId } = req.query;

  if (!subscriptionId)
    return res.status(400).json({
      status: false,
      code: 400,
      message: "subscriptionId is required",
    });

  try {
    const planDeleted = await subscriptionService.deletePlan(subscriptionId);
    return res.status(planDeleted.code).json(planDeleted);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.editPlan = async (req, res) => {
  const { subscriptionId } = req.query;
  const planData = req.body;

  if (!subscriptionId)
    return res.status(400).json({
      status: false,
      code: 400,
      message: "subscriptionId is required",
    });

  planData.planPic = req?.file ?? null;

  try {
    const planEdited = await subscriptionService.updatePlan({
      subscriptionId,
      planData,
    });
    return res.status(planEdited.code).json(planEdited);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.subscribeUser = async (req, res) => {
  const { userId, subscriptionId } = req.body;
  if (!userId || !subscriptionId)
    return res
      .status(400)
      .json({
        status: false,
        code: 400,
        message: "userId and subscriptionId are required",
      });

  try {

    const userSubscribed = await subscriptionService.subscribeUser({userId, subscriptionId});
    return res.status(userSubscribed.code).json(userSubscribed);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
