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
const Transaction = mongoose.model('Transaction',tSchema)
module.exports = Transaction