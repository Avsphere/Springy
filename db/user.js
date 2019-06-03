const mongoose = require('mongoose');
const path = require('path')
const ObjectId = mongoose.Schema.Types.ObjectId;



const userSchema = mongoose.Schema({
    key: {
        type: String,
        required : true
    },
    systems : []
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })



module.exports = mongoose.model('User', userSchema);