const Folder = require("./Folder");
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Notes = sequelize.define(
    "Notes",
    {
      note_title: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      note_content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        get() {
          const createdAt = this.getDataValue("created_at");
          if (createdAt) {
            return moment(createdAt).toISOString().split("T")[0];
          }
          return null;
        },
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        get() {
          // Format the date as "yyyy/mm/dd hh/mm/ss" before returning
          return this.getDataValue("updated_at")
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
        },
        set(value) {
          // Parse the incoming value as a Date and store it
          // This assumes that incoming values are in the "yyyy/mm/dd hh/mm/ss" format
          this.setDataValue("updated_at", new Date(value));
        },
      },
    },
    {
      schema: process.env.DATABASE_SCHEMA,
      timestamps: false,
    },
  );

  Notes.associate = (models) => {
    Notes.belongsTo(models.Folder, {
      foreignKey: "FolderId", // Use the correct foreign key field in the Notes table
      onDelete: "CASCADE",
    });
  };

  return Notes;
};
