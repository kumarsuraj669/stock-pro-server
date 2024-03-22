const express = require('express')
const router =  express.Router();
const { body, validationResult } = require('express-validator')
const fetchuser = require('../middleware/fetchuser')
const bcrypt = require('bcryptjs');
const User = require("../models/User")

// ROUTE 1 : Get loggedin user details using: GET "/api/users" - Login required
router.get('/', fetchuser, async (req, res)=>{
    let success = false;
    let serverStatus = false;
    try{
        const userId = req.user.USER_ID;
        const user = await User.findById(userId).select('-PASSWORD')
        success=true;
        serverStatus = true;
        res.json({success, serverStatus, data: user});
    } catch (error){
        res.status(500).json({success, serverStatus, 'error':"Internal Server Error"});
    }
})


// ROUTE 2 : Update user details using : PUT "/api/users" - Login required
router.put('/', fetchuser, async (req, res)=>{   
    const {business_name, old_password, new_password, address} = req.body;
    let success = false;
    let serverStatus = false;

    let newDetail = {}      // initialized new detail to be sent to the database
    const validationKeys = [];  // initilzed empty validation keys array

    if(business_name){
        // adding validation key for business_name field
        validationKeys.push(body('business_name', 'Min length is 3').isLength({ min: 3 }));
        newDetail.BUSINESS_NAME = business_name
    }
    if (new_password && old_password) {
        // adding validation key for new_password field
        validationKeys.push(body('new_password', 'Min length is 6').isLength({ min: 6 }));
        const userId = req.user.USER_ID;
        try{
            // find user by userId
            const user = await User.findById(userId);

            if (!user) { // user not found
                return res.status(404).json({ success, noMatch:true, serverStatus: true, error: "User not found" });
            }
            const isMatch = await bcrypt.compare(old_password, user.PASSWORD);

            if (!isMatch) { // provided old password doesn't matches the current password
                return res.status(400).json({ success, noMatch:true, serverStatus: true, error: "Old password is incorrect" });
            }
        } catch (e){
            return res.status(500).json({success,serverStatus, error: e})
        }
        
        // encypt the new password using salt and bcrypt hashing
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(new_password, salt);
        newDetail.PASSWORD = secPass;
    }
    if(address){newDetail.ADDRESS = address}

    // If there are errors, return Bad Request and the errors
    await Promise.all(validationKeys.map(validationKey => validationKey.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, serverStatus, 'errors': errors.array() });
    }
    
    try{
        const userId = req.user.USER_ID;
        let user = await User.findById(userId)
        serverStatus = true;
        if(!user){
            return res.status(404).json({success, serverStatus, "error":"Not found"});
        }

        // Find user by userId and update using newDetail
        user = await User.findByIdAndUpdate(userId, {$set: newDetail}, {new:true});
        success=true;

        res.json({success, serverStatus, "msg":"User details updated successfully"});

    } catch (error){
        res.status(500).json({success, serverStatus, 'error':"Internal Server Error"});
    }
    
})

module.exports = router;