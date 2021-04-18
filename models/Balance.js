const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const Schema = mongoose.Schema
const pSchema = new Schema({
    t: String,
    branch: Number,
    balance: SchemaTypes.Double,
})
const balanceModel = mongoose.model('balance', pSchema)
module.exports = balanceModel