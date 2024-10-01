const { paymentIntent, getAllOrders, updateOrderStatus } = require("../controllers/order");
const { authorized } = require("../middlewares/auth");

const router = require("express").Router();

router.post("/payment-stripe", paymentIntent);

router.get("/get/all", authorized , getAllOrders);

router.put("/update/status/:id", authorized, updateOrderStatus);

module.exports = router;