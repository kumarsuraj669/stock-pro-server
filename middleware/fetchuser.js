var jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const fetchuser = (req, res, next)=>{
    // Get the user from the jwt token and add to the req object
    const token = req.header('auth-token');
    if(!token){
        // if token is not found in the body 
        res.status(401).json({error: "Token empty"});   
    }
    try{
        // verify the token with the same SECRET_KEY that was used in hashing the password
        const data = jwt.verify(token, SECRET_KEY);
        req.user = data.users;
        next();
    } catch (e){
        res.status(401).json({error: "Please authenticate using a valid token"});   
    }
}

module.exports = fetchuser;