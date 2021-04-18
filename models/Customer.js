const mongoose = require('mongoose')
const Schema = mongoose.Schema
const cSchema = new Schema({
    user_id: Number,
    time: Number,
    email: String,
    fname: String,
    lname: String,
    identification_number: String,
    package: String,
    phone_number: String,
    mail_contact: String,
    bank: String,
    bank_number: String,
    bank_name: String,
    address: String,
    branch: Number
})
const Customer = mongoose.model('Customer', cSchema)
module.exports = Customer