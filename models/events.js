module.exports = function(sequelize, DataTypes){


  var Events = sequelize.define("Events", {

    med_count_number: {
      type: DataTypes.INTEGER
    },
    event_time: {
      type: DataTypes.DATE
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    taken_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

return Events;
};