const { DataTypes } = require("sequelize");
const sequelize = require("../../configs/db-config");

const user = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    index: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true,
  },
  profilePic: {
    type: DataTypes.STRING,
  },
  fcmToken: {
    type: DataTypes.STRING,
  },
  allowNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  contact: {
    type: DataTypes.STRING,
  },

  language: {
    type: DataTypes.STRING,
    defaultValue: "Eng",
  },

  signUpMethod: {
    type: DataTypes.STRING,
    defaultValue: "mail",
  },
  activeStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = user;
