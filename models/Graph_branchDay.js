const mongoose = require('mongoose')
const Schema = mongoose.Schema
const branchDaySchema = new Schema({
    user_id: Number,
    branch: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
})
const Graph_branchDay = mongoose.model('Graph_branchDay', branchDaySchema)
module.exports = Graph_branchDay
