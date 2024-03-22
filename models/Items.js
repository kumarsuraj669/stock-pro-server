const mongoose = require("mongoose");
const { Schema } = mongoose;

const ItemsSchema = new Schema({
  USER_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  MODEL_NAME: {
    type: String,
    required: true,
  },
  MODEL_NO: {
    type: String,
    required: true
  },
  CATEGORY: {
    type: String,
    required: true,
  },
  BUYING_PRICE: {
    type: Number,
    default: 0,
  },
  SELLING_PRICE: {
    type: Number,
    default: 0,
  },
  QUANTITY: {
    type: Number,
    default: 0,
    required: true,
  },
  TRANSACTION_HISTORY: {
    type: [
      {
        MESSAGE: {
          type: String,
        },
        DATE: { 
            type: Date, 
            default: Date.now 
        },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Items", ItemsSchema);
