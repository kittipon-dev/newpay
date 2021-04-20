const mongoose = require('mongoose')
const Schema = mongoose.Schema
const branchSchema = new Schema({
    user_id: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
})
const Graph_branch = mongoose.model('Graph_branch', branchSchema)
module.exports = Graph_branch
