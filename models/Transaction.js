const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
const TransactionSchema = new Schema({
    user_id: Number,
    dname: String,
    branch:Number,
    amount:Schema.Types.Double,
    nonce_str: String,
    time: String,
})
const Transaction = mongoose.model('Transaction', TransactionSchema)
module.exports = Transaction