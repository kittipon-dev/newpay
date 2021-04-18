const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DeviceSchema = new Schema({
    user_id: Number,
    group: Number,
    dname: Number,
    time: String,
    status: String,
    price1: Number,
    pulse1: Number,
    price2: Number,
    pulse2: Number,
    price3: Number,
    pulse3: Number,
})
const Device = mongoose.model('device', DeviceSchema)
module.exports = Device