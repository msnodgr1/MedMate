var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes){

  var User = sequelize.define("User", {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        len: [1]
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },{
  	hooks: {
  		beforeCreate: (user) => {
  			const salt = bcrypt.genSaltSync();
  			user.password = bcrypt.hashSync(user.password, salt);
  		}
  	} 
  });

User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password,this.password)  
}

return User;
};