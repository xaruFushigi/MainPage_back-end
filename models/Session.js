const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

require("dotenv").config({ path: "../.env" });

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    "Session",
    {
      sid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sess: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      expire: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      schema: "MainPageDB",
      timestamps: true,
    },
  );
  return Session;
};
