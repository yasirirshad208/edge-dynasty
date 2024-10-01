const Product = require('../models/Product');
const ResponseHandler = require('../utils/resHandler');
const ErrorHandler = require('../utils/errorHandler');
  const fs = require('fs')


exports.getProducts = async(req, res, next)=>{
    try {

        const products = await Product.find();

        return new ResponseHandler(res, 200, true, '', products)
        

    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}


exports.addProduct = async (req, res, next) => {
    const {
        name, productId, category, shipping, subCategory, description, price, discount,
        title, setInclude, materials, uses, storage, features, dimensions, idealFor, preferFor, topProduct
    } = req.body;

    try {
        const mainImage = req.files['mainImage'] ? req.files['mainImage'][0].path : null;
        const sideImages = req.files['sideImages'] ? req.files['sideImages'].map(file => file.path) : [];

        const product = new Product({
            name,
            productId,
            category,
            subCategory,
            description,
            price,
            discount,
            title,
            setInclude,
            dimensions,
            materials,
            uses,
            storage,
            features,
            mainImage,
            sideImages,
            shipping,
            idealFor, 
            preferFor,
            topProduct
        });

        await product.save();

        return new ResponseHandler(res, 201, true, `Product added successfully`, product);
    } catch (error) {
        console.error('Error adding product:', error); // More detailed logging
        return next(new ErrorHandler(error, 500));
    }
};


exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        return new ResponseHandler(res, 200, true, '', products);
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        // Handle new files
        let mainImage = product.mainImage;
        let sideImages = product.sideImages || [];

        // Update main image if provided
        if (req.files['mainImage']) {
            // Delete old main image if it exists
            if (mainImage && fs.existsSync(mainImage)) {
                fs.unlinkSync(mainImage);
            }
            mainImage = req.files['mainImage'][0].path;
        }

        // Update side images if provided
        if (req.files['sideImages']) {
            // Delete old side images if they exist
            sideImages.forEach(image => {
                if (fs.existsSync(image)) {
                    fs.unlinkSync(image);
                }
            });
            sideImages = req.files['sideImages'].map(file => file.path);
        }

        // Update product with new data
        await Product.updateOne(
            { _id: productId },
            {
                ...req.body,
                mainImage,
                sideImages,
            }
        );

        return new ResponseHandler(res, 200, true, 'Product updated successfully');
    } catch (error) {
        return next(new ErrorHandler(error.message || 'Failed to update product', 500));
    }
};


exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        // Delete product images from the filesystem
        if (product.mainImage && fs.existsSync(product.mainImage)) {
            fs.unlinkSync(product.mainImage);
        }

        product.sideImages.forEach(image => {
            if (fs.existsSync(image)) {
                fs.unlinkSync(image);
            }
        });

        await Product.findByIdAndDelete(req.params.id);

        return new ResponseHandler(res, 200, true, 'Product deleted successfully');
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
};

exports.getSingleProduct = async (req, res, next)=>{
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        return new ResponseHandler(res, 200, true, 'Product found successfully', product);
        
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}

exports.searchProducts = async (req, res, next) => {
    const { searchQuery } = req.query; // Get the search query from the request

    try {
        if (!searchQuery) {
            return new ResponseHandler(res, 400, false, 'Search query is required');
        }

        const products = await Product.find(
            { $text: { $search: searchQuery } }, 
            { score: { $meta: 'textScore' } } 
        ).sort({ score: { $meta: 'textScore' } }) 
         .limit(5); // Limit results to 5 products

        return new ResponseHandler(res, 200, true, 'Products found', products);
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
};


exports.getProductsByIds = async (req, res) => {
    const { ids } = req.body; 
  
    try {
      if (!ids || ids.length === 0) {
        return res.status(400).json({ message: 'No product IDs provided.' });
      }
  
      
      const products = await Product.find({ _id: { $in: ids } });
  
      
      return res.status(200).json(products);

    } catch (error) {
      return res.status(500).json({ message: 'Server error. Unable to fetch products.' });
    }
  };