const mongoose = require('mongoose')
const Schema = mongoose.Schema
const allYearSchema = new Schema({
    user_id: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
    time: String,
})
const Graph_allYear = mongoose.model('Graph_allYear', allYearSchema)
module.exports = Graph_allYear