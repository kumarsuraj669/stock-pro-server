const express = require('express')
const router =  express.Router();
const fetchuser = require('../middleware/fetchuser')
const History = require('../models/History')

// ROUTE 1 : Get all history using : GET "/api/history/" - Login required
router.get('/', fetchuser, async (req,res)=>{
    let success = false;
    let serverStatus = false;
    const userId = req.user.USER_ID
    try{
        // Search for the history document with the current userId
        const history = await History.findOne({USER_ID: userId});
        success=true;
        serverStatus = true;
        res.status(200).json({success,serverStatus, data: history || {}});
    } catch(e){
        res.status(500).json({success, serverStatus, error:"Internal Server Error", msg: e.message});
    }
})

// ROUTE 2 : Add a history : POST "/api/history/" - Login required
router.put('/', fetchuser, async (req,res)=>{
    let success = false;
    let serverStatus = false;
    try{
        const { msg, sale, purchase } = req.body;
        serverStatus = true;

        // If no msg is provided in the request body then send proper response asking for `msg`
        if(!msg ){
            return res.status(401).json({serverStatus, success, msg: "Please provide msg in the request body"})
        }

        const userId = req.user.USER_ID

        // Find the existing history for the user
        let userHistory = await History.findOne({ USER_ID: userId });

        // If no history found, create a new entry
        if (!userHistory) {
            userHistory = new History ({
                USER_ID: userId,
                HISTORY: [{
                    MESSAGE: msg || '',
                    SALE: sale || 0,
                    PURCHASE: purchase || 0
                }]
            });

            // Create a new history entry
            await userHistory.save();

        } else {
            // Concatenate the new history item to the existing history array
            userHistory.HISTORY.push({
                MESSAGE: msg || '',
                SALE: sale || 0,
                PURCHASE: purchase || 0
            });

            // Update the history in the database
            await History.findOneAndUpdate(
                { USER_ID: userId },
                { $set: { HISTORY: userHistory.HISTORY } },
                { new: true }
            );
        }

        success = true;
        res.json({ success, serverStatus, msg: "History updated successfully" });

    } catch(e){
        console.log(e.message);
        res.status(500).json({success, serverStatus, error:"Internal Server Error"});
    }
})

module.exports = router;