const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  uid_line: String
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
