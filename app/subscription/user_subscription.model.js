const { DataTypes } = require("sequelize");
const sequelize = require("../../configs/db-config");
const subscription = require("./subscription.model");
const user = require("../user/user.model");

const userSubscription = sequelize.define("userSubscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    index: true,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

user.hasMany(userSubscription, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE"});
userSubscription.belongsTo(user, { foreignKey: "userId" });

subscription.hasMany(userSubscription, { foreignKey: "subscriptionId", onDelete: "CASCADE", onUpdate: "CASCADE"});
userSubscription.belongsTo(subscription, { foreignKey: "subscriptionId" });

module.exports = userSubscription;
