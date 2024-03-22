const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    BUSINESS_NAME: {
        type: String,
        required: true
    },
    EMAIL: {
        type: String,
        required: true,
        unique: true,
    },
    PASSWORD: {
        type: String,
        required: true
    },
    CREATED_ON: {
        type: Date,
        default: Date.now
    },
    LAST_MODIFIED: {
        type: Date,
        default:  Date.now
    },
    ADDRESS: {
        type: String,
        required: true
    }

})

const UserModel = mongoose.model('User', UserSchema);       


module.exports = UserModel;