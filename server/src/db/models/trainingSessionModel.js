'use strict';

module.exports = (sequelize, DataTypes) => {
  const TrainingSession = sequelize.define('TrainingSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    completedOn: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    // optional: if you want to disable timestamp fields (createdAt, updatedAt)
    timestamps: true,
  });

  TrainingSession.associate = function(models) {
    // define association here if any
    TrainingSession.belongsTo(models.User);
    TrainingSession.hasMany(models.SessionActivity);
  };

  return TrainingSession;
};
