const mongoose = require('mongoose')
const Schema = mongoose.Schema
const branchYearSchema = new Schema({
    user_id: Number,
    branch: Number,
    amount: Schema.Types.Double,
    d: Number,
    m: Number,
    y: Number,
})
const Graph_branchYear = mongoose.model('Graph_branchYear', branchYearSchema)
module.exports = Graph_branchYear
