const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nameOfProject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      urlOfProject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageOfProject: {
        type: DataTypes.BLOB("long"), // BLOB for binary data
        allowNull: false,
      },
    },
    {
      schema: "MainPageDB",
      timestamps: true,
    },
  );
  return Project;
};
