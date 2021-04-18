const mongoose = require('mongoose')
const Schema = mongoose.Schema
const gSchema = new Schema({
    user_id: Number,
    shop: Number,
    time: String,
    amount: Number,
    d: Number,
    m: Number,
    y: Number
})
const Graph_year = mongoose.model('Graph_year', gSchema)
module.exports = Graph_year