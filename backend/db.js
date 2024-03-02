// Database connections and schema definitions. Bcrypt is also used to hash the password.

const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

async function connect() {
    await mongoose.connect("mongodb+srv://pranav_vinodan:A5zcpTiF4ZVk94ET@cluster0.ot2c5ok.mongodb.net/");
}

connect();

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // removes whitespace
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },

    password: {
        type: String,
        required: true,
        minLength: 6
    },

    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

// Method to generate a hash from plain text
usersSchema.methods.createHash = async function (plainTextPassword) {

    // Hashing user's salt and password with 10 iterations,
    const saltRounds = 10;
  
    // First method to generate a salt and then create hash
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
  
    // Second method - Or we can create salt and hash in a single method also
    // return await bcrypt.hash(plainTextPassword, saltRounds);
  };
  
  // Validating the candidate password with stored hash and hash function
  usresSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user model
        ref: "User",
        required: true
    },

    balance: {
        type: Number,
        required: true
    }
  });



const User = mongoose.model("User",usersSchema);
const Account = mongoose.model("Account", accountSchema);



module.exports = {
    User,
    Account,
};