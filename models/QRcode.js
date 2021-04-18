const mongoose = require('mongoose')
const Schema = mongoose.Schema
const QRcodeSchema = new Schema({
    user_id: Number,
    dname: Number,
    price1: Number,
    pulse1: Number,
    price2: Number,
    pulse2: Number,
    price3: Number,
    pulse3: Number,
    imgP1: String,
    imgP2: String,
    imgP3: String,
    time1: String,
    time2: String,
    time3: String,
    myobj1: Object,
    myobj2: Object,
    myobj3: Object
})
const QRcode = mongoose.model('qrcode', QRcodeSchema)
module.exports = QRcode