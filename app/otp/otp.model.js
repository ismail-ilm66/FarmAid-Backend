const { DataTypes } = require("sequelize");
const sequelize = require("../../configs/db-config");

const otp = sequelize.define("otp", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true,
  },
  otpCode: {
    type: DataTypes.INTEGER,
  },
  otpExpiry: {
    type: DataTypes.DATE,
  },
  otpRetries: {
    type: DataTypes.INTEGER,
  },
  otpDisabledTime: {
    type: DataTypes.DATE,
  },
  otpStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = otp;
