const mongoose = require('mongoose')
const Schema = mongoose.Schema
const gSchema = new Schema({
    user_id: Number,
    branch: Number,
    time: String,
    amount: Number,
    d: Number,
    m: Number,
    y: Number
})
const Graph_month = mongoose.model('Graph_month', gSchema)
module.exports = Graph_month