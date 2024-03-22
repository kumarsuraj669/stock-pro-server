const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI

const connectToMongo = async ()=>{
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch(e) {
        console.log("Error connecting to the database")
    }
}


module.exports = {connectToMongo};
