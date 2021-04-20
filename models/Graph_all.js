const mongoose = require('mongoose')
const Schema = mongoose.Schema
const allSchema = new Schema({
    user_id: Number,
    branch: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
    time: String,
})
const Graph_all = mongoose.model('Graph_all', allSchema)
module.exports = Graph_all