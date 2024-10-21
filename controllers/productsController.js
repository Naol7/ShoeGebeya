const User = require('../models/User')
const Product = require('../models/Product')
const asyncHandler = require('express-async-handler')


const getAllProducts = asyncHandler(async (req, res) =>{
    const products = await Product.find().select('-password').lean()
    if(!products?.length){
        return res.status(400).json({message: 'No products found'})
    }
    res.json(products)
})
const getProductsWithUsers = asyncHandler(async (req, res) => {
    const products = await Product.find().lean().exec();

    // Map over the products and attach the associated user's username
    const productsWithUser = await Promise.all(products.map(async (product) => {
        const user = await User.findById(product.user).lean().exec();
        return { ...product, username: user?.username || 'Unknown' };
    }));

    // Respond with the products that now include the username
    res.json(productsWithUser);
});

const createNewProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, category, user } = req.body;

    // Check for required fields
    if (!name || !price || !description || !category || !image || !user) {
        return res.status(400).json({ message: 'All fields including user are required to upload a product' });
    }

    // Create new product
    const product = await Product.create({ name, price, description, category, image, user });

    // Check if product was created successfully
    if (product) {
        return res.status(201).json({ message: 'New product created' });
    } else {
        return res.status(400).json({ message: 'Invalid product data received' });
    }
});



const updateProduct = asyncHandler(async (req, res) =>{
    const {id, name, price, description, image, category } = req.body
    if(!id || !name || !price|| !category|| !description || !image || !category){
        res.status(400).json({message: 'All fields are required'})
    }
    const product = await Product.findById(id).exec()
    if(!product){
        return res.status(400).json({message: 'product not found.'})
    }
    
    product.name = name
    product.category = category
    product.price = price
    
    const updatedProduct = await product.save()
    res.json({message: `${updatedProduct.name} updated.`})
})
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Check if ID is provided
    if (!id) {
        return res.status(400).json({ message: 'Product ID required' });
    }


 
    // Find the user by ID
    const product = await Product.findById(id).exec();
    if (!product) {
        return res.status(400).json({ message: 'Product not found' });
    }

    // Capture the username and ID before deletion
    const { name, _id } = product;

    // Delete the user
    await product.deleteOne();

    // Respond with the username and ID
    const reply = `product ${name} with ID ${_id} deleted.`;
    res.json({ message: reply });
});


module.exports = {
    getAllProducts,
    createNewProduct,
    updateProduct,
    deleteProduct
}