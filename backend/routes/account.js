const express = require('express');
const { authMiddleware } = require("../middleware");
const { Account } = require('../db');

const router = express.Router();

router.get("/balance", authMiddleware, async (req,res) => {

    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})

router.post("/transfer", authMiddleware, async (req, res) => {
   const session = await Account.startSession(); /* This is a MongoDB method that starts a session. This is often used in conjunction with transactions as it allows 
   you to perform multiple operations on the database and then commit them all at once. */

   session.startTransaction(); /* This will start a transaction in the session. It ensures that operations are performed in a single flow and if there is an error
   it reverts the whole transaction. */

   try {
    const { amount, to } = req.body;

    const account = await Account.findOne({
        userId: req.userId
    }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient Balance"
        });
    }
        const toAccount = await Account.findOne({ userId: to}).session(session);

        if(!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid Recipient"
            });
        }

        await Account.updateOne({
            userId: req.userId
        }, {$inc : { balance: -amount}}).session(session);

        await Account.updateOne({
            userId: to
        }, {$inc : { balance: amount}}).session(session);

        await session.commitTransaction(); // This will finish the transaction and commit all the operations to the database.

        res.json({
            message: "Transfer Successful"
        });

} catch (err) {
    await session.abortTransaction();
    res.status(500).json({
        message: "Internal Server Error"
    });
}
});

module.exports = router;