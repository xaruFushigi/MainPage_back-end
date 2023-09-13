const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const Resume = sequelize.define(
    "Resume",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nameOfResume: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      typeOfResume: { type: DataTypes.STRING, allowNull: false },
      uploadResume: {
        type: DataTypes.BLOB("long"), // BLOB for binary data
        allowNull: false,
      },
    },
    {
      schema: "MainPageDB",
      timestamps: true,
    },
  );
  return Resume;
};
