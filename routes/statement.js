const express = require('express')
const router =  express.Router();
const fetchuser = require('../middleware/fetchuser')
const History = require('../models/History')

// ROUTE 1 : Get all statement using : POST "/api/statement/" - Login required
router.post('/', fetchuser, async(req, res)=>{
    let success = false;
    let serverStatus = false;
    const userId = req.user.USER_ID
    const { startDate, endDate } = req.body;

    try{
        serverStatus = true;
        let query = { USER_ID: userId };
        const history = await History.findOne(query);

        // startDate and endDate must be in the request body before fetching statement from database
        if (!startDate || !endDate) {
            return res.status(401).json({serverStatus, success, msg: "please provide start and end date in the body"})
        }
        success = true;
        const filteredHistory = filterHistoryByDate(history.HISTORY, startDate, endDate);

        // Calculate total sales and purchases
        const { totalSales, totalPurchases } = calculateTotalSalesAndPurchases(filteredHistory);

        res.status(200).json({success,serverStatus, data: {totalSales, totalPurchases}});
    } catch(e){
        res.status(500).json({success, serverStatus, error:"Internal Server Error", msg: e.message});
    }
})

const filterHistoryByDate = (historyArray, startDate, endDate) => {
    // Convert start and end dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
  
    // Filter history array based on date range
    const filteredHistory = historyArray.filter(item => {
      const itemDate = new Date(item.DATE);
      return itemDate >= startDateObj && itemDate <= endDateObj;
    });
  
    return filteredHistory;
  };

  // Function to calculate total sales and purchases
const calculateTotalSalesAndPurchases = (filteredHistory) => {
    let totalSales = 0;
    let totalPurchases = 0;

    // Go through each history in the selected time period and add the totalSales and totalPurchases
    filteredHistory.forEach(item => {
        if (item.SALE) {
            totalSales += item.SALE;
        }
        if (item.PURCHASE) {
            totalPurchases += item.PURCHASE;
        }
    });

    return { totalSales, totalPurchases };
};


module.exports = router;