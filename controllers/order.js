const Stripe = require("stripe");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const Product = require("../models/Product");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const ResponseHandler = require("../utils/resHandler");



exports.paymentIntent = async (req, res) => {

  const secKey = process.env.STRIPE_SEC_KEY
const stripe = Stripe(secKey);
    const { paymentMethodId, amount, products, email, firstName, lastName, country, streetAddress1, streetAddress2, state, city, postCode, phone, saveInfo } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // Prevent redirects
        },
      });
  
     
      const lastOrder = await Order.findOne().sort({ createdAt: -1 }).select("orderId");
      const newOrderId = lastOrder ? lastOrder.orderId + 1 : 1; 
      const formattedOrderId = `ED${newOrderId}`; 

      
      const productIds = products.map(product => product._id);
  
      const detailedProducts = await Product.find({ _id: { $in: productIds } });
  
  
   
      const productsWithDetails = products.map(product => {
        const foundProduct = detailedProducts.find(p => p._id.toString() === product._id.toString());
        return {
          name: foundProduct.name,
          title: foundProduct.title || "N/A", 
          price: foundProduct.price,
          quantity: product.quantity,
          totalPrice: foundProduct.price * product.quantity,
        };
      });
    
      const order = new Order({
        orderId:newOrderId,
        products,
        amount,
        shipping: 30,
        email,
        firstName,
        lastName,
        country,
        streetAddress1,
        streetAddress2,
        state,
        city,
        postCode,
        phone,
      });

    
  
      // Prepare the order confirmation message
      const message = `
      Order Details:

      Order Id: ${formattedOrderId}
      
      Products:
      ${productsWithDetails.map((product, index) => 
        `  ${index + 1}. Name: ${product.name}, Title: ${product.title},ProductId: $${product.productId}, Price: $${product.price}, Quantity: ${product.quantity}, Total: $${product.totalPrice}`
      ).join('\n')}
      
      Amount: $${amount}
      Shipping: $30
      
      Customer Information:
      - Email: ${email}
      - First Name: ${firstName}
      - Last Name: ${lastName}
      - Country: ${country}
      - Street Address 1: ${streetAddress1}
      - Street Address 2: ${streetAddress2 || 'N/A'}
      - State / Province: ${state}
      - City: ${city}
      - Postal Code: ${postCode}
      - Phone: ${phone}
      
      Thank you for your order!
      `;
  
      await sendEmail({
        email: process.env.NOTIFICATION_EMAIL,
        subject: "Edge Dynasty Order",
        message,
      });
  
      const emailMessage = `
      Order Details:

      Order Id: ${formattedOrderId}
      
      Products:
      ${productsWithDetails.map((product, index) => 
        `  ${index + 1}. Name: ${product.name}, Title: ${product.title}, Price: $${product.price}, Quantity: ${product.quantity}, Total: $${product.totalPrice}`
      ).join('\n')}
      
      Amount: $${amount}
      Shipping: $30
      
      Thank you for your order!
      `;

      await sendEmail({
        email: email,
        subject: "Edge Dynasty Order",
        emailMessage,
      });


      // Save the order to the database
      await order.save();

      if(saveInfo === 'save-info'){
        const user = await User.findOne({email});
        
        user.country = country
        user.streetAddress1 = streetAddress1
        user.streetAddress2 = streetAddress2
        user.state = state
        user.postCode = postCode
        user.city = city
        user.phone = phone
        user.saveInfo = saveInfo

        await user.save()
      }

      
  
      res.status(200).json({ success: true, paymentIntent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

  exports.getAllOrders = async (req, res, next) => {
    try {
        // Populate the products field with details from the Product model
        const orders = await Order.find().populate("products._id").sort({ createdAt: -1 });

        return new ResponseHandler(res, 200, true, "", orders);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

 

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params; 
  const { orderStatus } = req.body; 

  // Ensure orderStatus is valid
  const validStatuses = ["processing", "delivered", "cancelled", "returned"];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    // Find the order by ID and update the status
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order's status
    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the order status",
      error: error.message,
    });
  }
};
