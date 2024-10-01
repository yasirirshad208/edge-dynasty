const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    country: {
        type: String,
    },
    streetAddress1: {
        type: String,
    },
    streetAddress2: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    postCode: {
        type: String,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    saveInfo: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    resetPassVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    verificationContext: String
});

module.exports = mongoose.model("User", userSchema);
