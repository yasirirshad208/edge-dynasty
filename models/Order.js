const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    products: [
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
        },
    ],
    orderId:{ type: Number, required: true },
    amount: { type: Number, required: true },
    shipping: { type: Number, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    streetAddress1: { type: String, required: true },
    streetAddress2: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    phone: { type: String, required: true },
    orderStatus:{
        type:String,
        enum:["processing", "delivered", "cancelled", "returned"],
        default:"processing"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
