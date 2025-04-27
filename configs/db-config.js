const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: "mysql",
    logging: false,
    dialectModule: require("mysql2"),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;

// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.MYSQLDATABASE,
//   process.env.MYSQLUSER,
//   process.env.MYSQLPASSWORD,
//   {
//     host: process.env.MYSQLHOST,
//     port: process.env.MYSQLPORT,
//     dialect: "mssql", // Change from "mysql" to "mssql"
//     logging: false,
//     dialectModule: require("tedious"), // Use tedious instead of mysql2
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     dialectOptions: {
//       options: {
//         encrypt: true, // For Azure SQL Database connections
//         trustServerCertificate: true, // Change to true if you have certificate issues
//       },
//     },
//   }
// );

// module.exports = sequelize;
