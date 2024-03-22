const express = require('express')
const User = require("../models/User")
const router =  express.Router();
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY

// Validations to perform before processing requests
const validationKeys = [
    body('business_name', 'Min length is 3').isLength({min:3}),
    body('email', 'Invalid Email').isEmail(),
    body('password', 'Min length is 6').isLength({min:6}),
    body('address', 'Please provide address').exists()
]

// ROUTE 1: Create a user using : POST "api/auth/signup"
router.post('/signup',validationKeys, async (req,res)=>{

    let success = false;
    let serverStatus = false;
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);

    if(!req.body.business_name || !req.body.email || !req.body.address || !req.body.password){
        return res.status(401).json({success, serverStatus, errors: "Please provide all details before signup"})
    }

    if (!errors.isEmpty()){
        return res.status(400).json({success, serverStatus, 'errors': errors.array() });
    }

    try{
        // Checking if the user already exists in the database
        let user = await User.findOne({EMAIL: req.body.email});
        serverStatus = true;
        if (user){
            return res.status(400).json({success, serverStatus, exists:true, errors:"User with this email already exists"})    
        }

        // Generate salt for the password 
        const salt = await bcrypt.genSalt(10);
        // Hash the password using salt before sending to database
        const secPass = await bcrypt.hash(req.body.password, salt);
        
        await User.create({
            BUSINESS_NAME: req.body.business_name,
            PASSWORD: secPass,
            EMAIL: req.body.email,
            ADDRESS: req.body.address
        })

        success = true;
        res.status(200).json({success, serverStatus, 'msg': "Data sent to the server"})
    } catch (e){
        res.status(500).json({success, serverStatus, 'errors': "Some Error occured"});
    }
    
})


// ROUTE 2 : Authenticate a user using : POST "/api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()  
], async (req, res)=>{
    // If there is any error return bad request
    const errors = validationResult(req);
    let success = false;
    let serverStatus = false;
    if (!errors.isEmpty()){
        return res.status(400).json({success, 'errors': errors.array() });
    }

    const {email, password} = req.body;
    try{
        let user = await User.findOne({EMAIL: email});
        serverStatus = true;
        if(!user){
            return res.status(400).json({success, serverStatus, 'error': "Please try to login with correct credentials"});
        }

        // Comparing the existing password will entered password
        const passwordCompare = await bcrypt.compare(password, user.PASSWORD);

        // If password is not matched return error with proper message
        if (!passwordCompare){
            return res.status(400).json({success, serverStatus, 'error': "Please try to login with correct credentials"})
        }

        const data = {
            users: {
                USER_ID: user.id
            }
        }

        // After password matches create a authtoken using jwt(json web token)
        const authtoken = jwt.sign(data, SECRET_KEY);
        success=true;
        res.json({success, serverStatus, authtoken});
    }catch(e){
        res.status(500).json({success, serverStatus, 'error':"Internal Server Error"});
    }
})


module.exports = router;