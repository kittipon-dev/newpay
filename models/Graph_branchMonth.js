const mongoose = require('mongoose')
const Schema = mongoose.Schema
const branchMonthSchema = new Schema({
    user_id: Number,
    branch: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
})
const Graph_branchMonth = mongoose.model('Graph_branchMonth', branchMonthSchema)
module.exports = Graph_branchMonth
