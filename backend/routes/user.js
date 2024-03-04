// Initialzation of user router, all the user related routes are defined here.

const { User, Account } = require('../db');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config');
const { authMiddleware } = require('../middleware');
const express = require('express');

const router = express.Router();


const signUpSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

router.post("/signup", async (req,res) => {
    const { success } = signUpSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Email already taken/ Invalid inputs"})
    } 

    const existingUser = await User.findOne({ 
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({ 
            message: "Email already exists/ Incorrect Inputs"
        })
    }


    const user = await User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password_hash: await bcrypt.hash(req.body.password, 10)
    });

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })


    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token : token
    })

});

const signInSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signInSchema.safeParse(req.body);

    if(!success) {
        return res.status(411).json({ message: "Invalid inputs"});
    }

    const user = await User.findOne({
        username: req.body.username
    })

    if (!user) {
        return res.status(411).json({ message: "Invalid inputs"});
    } else if (await user.validatePassword(req.body.password)) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            message: "User signed in successfully",
            token: token
        })
        return;
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})
router.put("/user", authMiddleware, async (req,res) => {
    const { success } = updateBody.safeParse(req.body);

    if(!success) {
        return res.status(411).json({ message: "Error in updating user"});
    }

    await User.updateOne({
        _id: req.userId
    }, req.body);

    res.json({
        message: "User updated successfully"
    })
});

router.get("/user/bulk", authMiddleware, async (req,res) => {
    const filter = req.query.filter || "";  // This will ensure that if no filter is provided, it will evaluate to an empty string

    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter            
            }, 

            lastname: {
                "$regex": filter
            }
        }]
    }) // This is the mongoDB query to find users whose parameters match or look like the filter.

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        })) // This will use the map function to create a new array of users with only the parameters we want to return.

        })
    })

module.exports = router;