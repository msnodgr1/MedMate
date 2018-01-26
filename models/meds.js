module.exports = function(sequelize, DataTypes){


  var Meds = sequelize.define("Meds", {

    med_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        len: [1]
      }
    },
    med_dose: {
      type: DataTypes.STRING,
      allowNull: false
    },
    freq_main: {
      type: DataTypes.STRING,
      allowNull: false
    },
    freq_times: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hr_interval: {
      type: DataTypes.TIME
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: 080000
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    first_med: {
      type: DataTypes.DATE,
    },
    next_med:{
      type: DataTypes.DATE,
    },
    instructions: {
      type: DataTypes.STRING
    },
    initial_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remaining_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

return Meds;
};