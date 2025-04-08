const { DataTypes } = require("sequelize");
const sequelize = require("../../configs/db-config");

const subscription = sequelize.define("subscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    index: true,
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  planPic: {
    type: DataTypes.STRING,
  },
  planPrice: {
    type: DataTypes.DOUBLE,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
});

module.exports = subscription;
