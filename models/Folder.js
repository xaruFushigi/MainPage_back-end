require("dotenv").config({ path: "../.env" });
const Notes = require("./Folder");

module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define(
    "Folder",
    {
      folder_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      schema: process.env.DATABASE_SCHEMA,
      timestamps: false,
    },
  );

  Folder.associate = (models) => {
    Folder.belongsTo(models.Folder, {
      onDelete: "CASCADE",
    });
  };

  return Folder;
};
