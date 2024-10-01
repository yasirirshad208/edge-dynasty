const express = require('express');
const connectDatabase = require('./config/database');
const dotenv = require('dotenv');
const cors = require('cors')
const errorMiddleware = require('./middlewares/error');

const product = require('./routes/product.js');
const user = require('./routes/user.js');
const contact = require('./routes/contact.js');
const order = require('./routes/order.js');

const app = express();

app.use(express.json());
app.use(cors())

dotenv.config({path: "./config/config.env"});

app.use(express.static('public'));

// Serve files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// db connection
connectDatabase();

//api routes 
app.use('/api/product', product);
app.use('/api/user', user);
app.use('/api/contact', contact);
app.use('/api/order', order);

// error middleware
app.use(errorMiddleware); 
// hhhh

app.listen(process.env.PORT,()=>{
    console.log(`Backend server is running`)
});