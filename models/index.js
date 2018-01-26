'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env.JAWSDB_URL);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}


db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Models/tables
db.User = require('./user.js')(sequelize, Sequelize);  
db.Meds = require('./meds.js')(sequelize, Sequelize);  
db.Events = require('./events.js')(sequelize, Sequelize);

//Relations
db.Events.belongsTo(db.Meds, {
	foreignKey: {
		allowNull: false
	},
	onDelete: "cascade"
});

db.Meds.hasMany(db.Events, {
	foreignKey: {
		allowNull: false
	},
	onDelete: "cascade"
	});  

db.Meds.belongsTo(db.User, {
	foreignKey: {
		allowNull: false
	},
	onDelete: "cascade"
	});  

db.User.hasMany(db.Meds, {
	foreignKey: {
		allowNull: false
	},
	onDelete: "cascade"
	});

module.exports = db;
