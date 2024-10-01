const mongoose = require('mongoose');

// Define the Product Schema
const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // Ensure name is mandatory
        },
        productId: {
            type: String,
            required: true, // Ensure productId is mandatory
        },
        category: {
            type: String,
            required: true, // Ensure category is mandatory
        },
        subCategory: {
            type: String,
        },
        description: {
            type: String,
        },
        price: {
            type: String,
            required: true, // Ensure price is mandatory
        },
        discount: {
            type: String,
        },
        title: {
            type: String,
        },
        setInclude: {
            type: [String], // Array of strings
        },
        dimensions: {
            type: [String], // Array of strings
        },
        preferFor: {
            type: [String], // Array of strings
        },
        idealFor: {
            type: [String], // Array of strings
        },
        materials: {
            type: [String], // Array of strings
        },
        uses: {
            type: [String], // Array of strings
        },
        storage: {
            type: String,
        },
        features: {
            type: [String], // Array of strings
        },
        mainImage: {
            type: String, // Path to main image
        },
        sideImages: {
            type: [String], // Paths to side images
        },
        shipping: {
            type: String,
            default: '0', // Default shipping cost as '0'
        },
        topProduct: {
            type: Boolean,
            default: false, // Default topProduct to false
        },
    },
    {
        timestamps: true, // Auto-manage createdAt and updatedAt
    }
);

// Create a text index for the schema to support global search
ProductSchema.index({
    name: 'text',
    description: 'text',
    category: 'text',
    subCategory: 'text',
    materials: 'text',
    features: 'text',
    title: 'text',
    uses: 'text',
    preferFor: 'text',
    idealFor: 'text',
});


module.exports = mongoose.model('Product', ProductSchema);
