const { addProduct, getProducts, updateProduct, deleteProduct, getSingleProduct, searchProducts, getProductsByIds } = require("../controllers/product");
const upload = require('../config/multer');

const router = require('express').Router();

router.post('/add', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'sideImages', maxCount: 10 }
]), addProduct);


router.get('/get/all', getProducts);

router.put('/update/:id', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'sideImages', maxCount: 10 }
]), updateProduct);


router.delete('/delete/:id', deleteProduct);

router.get('/single/:id', getSingleProduct);

router.get('/search', searchProducts);

router.post("/products-by-ids", getProductsByIds)

module.exports = router;
