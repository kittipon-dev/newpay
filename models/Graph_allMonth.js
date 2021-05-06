const mongoose = require('mongoose')
const Schema = mongoose.Schema
const allMonthSchema = new Schema({
    user_id: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
    time: String,
})
const Graph_allMonth = mongoose.model('Graph_allMonth', allMonthSchema)
module.exports = Graph_allMonth