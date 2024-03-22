const express = require('express')
const router =  express.Router();
const fetchuser = require('../middleware/fetchuser')
const Items = require('../models/Items')

// ROUTE 1 : Get all the items using : GET "/api/notes/" - Login required
router.get('/getItems', fetchuser, async(req, res)=>{
    let success = false;
    let serverStatus = false;
    const userId = req.user.USER_ID
    try{
        // Find the documents from items collection with the current userId
        const items = await Items.find({USER_ID: userId});
        success=true;
        serverStatus = true;
        res.status(200).json({success, serverStatus, data: items});
    } catch(e){
        console.log(e.message);
        res.status(500).json({success, serverStatus, error:"Internal Server Error"});
    }
})

// ROUTE 2 : Add item using : POST "/api/items/" - Login required
router.post('/addItem', fetchuser, async (req, res)=>{
    let success=false;
    let serverStatus = false;
    try{
        const {model_no, model_name, category, buying_price, selling_price, quantity} = req.body;

        serverStatus = true;
        const userId = req.user.USER_ID;

        // Find the item with current userId and selected modelNo
        let item = await Items.findOne({ USER_ID: userId, MODEL_NO: model_no });

        let newItem = {}
        let msg = ""

        if(item){
            // Item exists so it is an increment operation
            if(!model_no || !buying_price || !selling_price || !quantity){
                return res.status(401).json({serverStatus, success, "error":"model_no, buying_price, selling_price, quantity are required"})
            }

            msg = `${quantity} units purchased for Rs. ${buying_price}`
            // Get the average of old and new price
            let newBuyingPrice = ((item.BUYING_PRICE*item.QUANTITY + buying_price*quantity)/(item.QUANTITY + quantity)).toFixed(2)
            let newSellingPrice = ((item.SELLING_PRICE*item.QUANTITY + selling_price*quantity)/(item.QUANTITY + quantity)).toFixed(2)

            newItem.BUYING_PRICE = newBuyingPrice
            newItem.SELLING_PRICE = newSellingPrice
            newItem.QUANTITY = item.QUANTITY + quantity;
            newItem.TRANSACTION_HISTORY = item.TRANSACTION_HISTORY.concat({MESSAGE: msg});

            item = await Items.findOneAndUpdate({ MODEL_NO: model_no }, { $set: newItem }, { new: true });
            success=true;
            return res.json({success, serverStatus, "msg":"Item updated successfully"});
        } 

        // Item does not exist, it is an add operation
        if(!model_no || !buying_price || !selling_price || !quantity || !model_name || !category){
            return res.status(401).json({serverStatus, success, "error":"model_no, buying_price, selling_price, model_name, category, quantity are required"})
        }

        msg = `{${quantity} units purchased for Rs. ${buying_price}}`
        let transaction_history = []
        // Concatenate the new history to the existing transaction_history array
        transaction_history.push({MESSAGE: msg})

        item = new Items({
            USER_ID: userId,
            MODEL_NO: model_no,
            MODEL_NAME: model_name,
            CATEGORY: category,
            BUYING_PRICE: buying_price,
            SELLING_PRICE: selling_price,
            QUANTITY: quantity,
            TRANSACTION_HISTORY: transaction_history
        })
        const savedItem = await item.save();
        success=true;
        res.status(200).json({success, serverStatus, "msg": "Item added successfully"});
    } catch(e){
        console.log(e.message);
        res.status(500).json({success, serverStatus, 'error':"Internal Server Error", "msg": e.message});
    }
    
})

// ROUTE 2 : Sell item using : POST "/api/items/sellItem" - Login required
router.put('/sellItem', fetchuser, async (req, res)=>{
    let success=false;
    let serverStatus = false;
    try{
        const {model_no, selling_price, quantity} = req.body;

        serverStatus = true;
        let item = await Items.findOne({ USER_ID: req.user.USER_ID, MODEL_NO: model_no });

        if(!item){
            return res.status(404).json({success, serverStatus, "error":"Not found"});
        }
         
        if(!model_no || !selling_price || !quantity){
            return res.status(404).json({success, serverStatus, "error":"model_no, selling_price, quantity are required"});
        }

        let newItem = {}
        let msg = `${quantity} units sold for Rs. ${selling_price}`

        newItem.TRANSACTION_HISTORY = item.TRANSACTION_HISTORY.concat({MESSAGE: msg});
        newItem.QUANTITY = item.QUANTITY - quantity;

        item = await Items.findOneAndUpdate({ MODEL_NO: model_no }, { $set: newItem }, { new: true });
        success=true;
        return res.json({success, serverStatus, "msg":"Item updated successfully"});

    } catch(e){
        console.log(e.message);
        res.status(500).json({success, serverStatus, 'error':"Internal Server Error", "msg": e.message});
    }
    
})


module.exports = router;