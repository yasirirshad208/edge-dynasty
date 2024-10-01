const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
        },
        lastName:{
            type:String,
        },
        email:{
            type:String,
        },
        phone:{
            type:String,
        },
        message:{
            type:String,
        }
    },
    {
        timestamps:true
    }
);

module.exports = mongoose.model('Contact', ContactSchema)