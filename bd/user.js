const Sequelize = require ('sequelize');
const bcrypt = require ('bcrypt');

const sequelize = new Sequelize('postgres://postgres:aidalox2011@localhost:5432/register');

const User = sequelize.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  years: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
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



sequelize.sync()
  .then(()=>console.log('Users table has been successfully created !'))
  
.catch(error => console.log('This error occured', error))
module.exports = User;