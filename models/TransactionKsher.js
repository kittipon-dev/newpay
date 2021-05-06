const mongoose = require('mongoose')
const Schema = mongoose.Schema
const tSchema = new Schema({
    code: Number,
    version: String,
    status_code: String,
    msg: String,
    time_stamp: String,
    status_msg: String,
    data: Object,
    sign: String
})
const TransactionKsher = mongoose.model('Transaction_ksher',tSchema)
module.exports = TransactionKsher