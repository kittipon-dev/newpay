const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uidlineSchema = new Schema({
  user_id: String,
  uid: String
});

const UidLine = mongoose.model('Uid_Line', uidlineSchema);

module.exports = UidLine;
