const User = require('../models/User')
const Product = require('../models/Product')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


const getAllUsers = asyncHandler(async (req, res) =>{
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    // Check for required fields
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required to create a user' });
    }

    // Check if username already exists
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // Hash the password and create the user
    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        const userObject = { username, "password": hashedPwd, roles };

        const user = await User.create(userObject);

        if (user) {
            res.status(201).json({ message: `New user ${username} created` });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

const updateUser = asyncHandler(async (req, res) =>{
    const {id, username, roles, active, password } = req.body
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' ){
        res.status(400).json({message: 'All fields are required'})
    }
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message: 'user not found.'})
    }
    const duplicate = await User.findOne({ username }).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'duplicate username'})
    }
    user.username = username
    user.roles = roles
    user.active = active
    if(password){
        user.password = await bcrypt.hash(password, 10)

    }
    const updatedUser = await user.save()
    res.json({message: `${updatedUser.username} updated.`})
})
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Check if ID is provided
    if (!id) {
        return res.status(400).json({ message: 'User ID required' });
    }

    // Check if the user has any assigned products
    const product = await Product.findOne({ user: id }).lean().exec();
    if (product) {
        return res.status(400).json({ message: 'User has assigned products' });
    }

    // Find the user by ID
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Capture the username and ID before deletion
    const { username, _id } = user;

    // Delete the user
    await user.deleteOne();

    // Respond with the username and ID
    const reply = `Username ${username} with ID ${_id} deleted.`;
    res.json({ message: reply });
});


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}