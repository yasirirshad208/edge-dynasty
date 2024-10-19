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
      const htmlMessage = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #f97316;">Order Details</h2>

      <h3 style="color: #f97316;">Order ID: ${formattedOrderId}</h3>
      
  
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
       <thead>
         <tr>
         <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">#</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Product Id</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Name</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Title</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Price</th> 
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Qty</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Total</th>
         </tr>
       </thead>
       <tbody>
      ${productsWithDetails.map((product, index) => 
        `
        <tr>
          <td style="padding: 8px; color:black">${index + 1}</td>
        <td style="padding: 8px;color:black">${product.productId}</td>
        <td style="padding: 8px;color:black">${product.name}</td>
        <td style="padding: 8px;color:black">${product.title}</td>
        <td style="padding: 8px;color:black">$${product.price}</td>
        <td style="padding: 8px;color:black">${product.quantity}</td>
        <td style="padding: 8px;color:black">$${product.totalPrice}</td>
        </tr>
        `
      ).join('\n')}

      </tbody>
      </table>
      
      <h4 style="color:black">Shipping: $30</h4>
      <h4 style="color:black">Amount: $${amount}</h4>
      
      <h3 style="color: #f97316;">Customer Information</h3>
      <p style="color:black">
      - Email: ${email}<br>
      - First Name: ${firstName} ${lastName}<br>
      - Country: ${country}<br>
      - Street Address 1: ${streetAddress1}<br>
      - Street Address 2: ${streetAddress2 || 'N/A'}<br>
      - State / Province: ${state}<br>
      - City: ${city}<br>
      - Postal Code: ${postCode}<br>
      - Phone: ${phone}<br>
      </p>
      
      </div>
      </html>
      </body>
      `;

  
      await sendEmail({
        email: process.env.NOTIFICATION_EMAIL,
        subject: "Edge Dynasty Order",
        htmlMessage,
      });
  
      const emailMessage = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #f97316;">Order Details</h2>

      <h3 style="color: #f97316;">Order ID: ${formattedOrderId}</h3>
      
  
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
       <thead>
         <tr>
         <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">#</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Name</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Title</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Price</th> 
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Qty</th>
           <th style="text-align: left; padding: 8px; background-color: #f97316; color: white;">Total</th>
         </tr>
       </thead>
       <tbody>
      ${productsWithDetails.map((product, index) => 
        `
        <tr>
          <td style="padding: 8px; color:black">${index + 1}</td>
        <td style="padding: 8px;color:black">${product.name}</td>
        <td style="padding: 8px;color:black">${product.title}</td>
        <td style="padding: 8px;color:black">$${product.price}</td>
        <td style="padding: 8px;color:black">${product.quantity}</td>
        <td style="padding: 8px;color:black">$${product.totalPrice}</td>
        </tr>
        `
      ).join('\n')}

      </tbody>
      </table>
      
      <h4 style="color:black">Shipping: $30</h4>
      <h4 style="color:black">Amount: $${amount}</h4>
      
      <p style="color: #f97316;">Thank you for ordering.</p>
      </div>
      </html>
      </body>
      `;

      await sendEmail({
        email: email,
        subject: "Edge Dynasty Order",
        htmlMessage:emailMessage,
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
