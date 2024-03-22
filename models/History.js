const mongoose = require('mongoose');
const {Schema} = mongoose;

const HistorySchema = new Schema({
    USER_ID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    HISTORY: [{
        MESSAGE: String,
        SALE: Number,
        PURCHASE: Number,
        DATE: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('History', HistorySchema);