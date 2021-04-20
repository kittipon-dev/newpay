const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
const rSchema = new Schema({
    user_id: Number,
    dname: String,
    branch:Number,
    amount:Schema.Types.Double,
    nonce_str: String,
    d: Number,
    m: Number,
    y: Number,
    t: String,
    run: Boolean
})
const Run = mongoose.model('run', rSchema)
module.exports = Run