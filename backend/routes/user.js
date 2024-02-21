const { User } = require('../db');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config');

const router = express.Router();


const signUpSchema = zod.object({
    username: zod.string.email(),
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
    })

    var hashedPassword = await user.createHash(req.body.password);
    user.password_hash = hashedPassword;

    const userId = user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token : token
    })

});

const signInSchema = zod.object({
    username: zod.string.email(),
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


module.exports = router;