const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/connectmongo');
const { writeLog, getLogs } = require('../config/serverLogs');

// Admin Dashboard Statistics
router.get('/dashboard', async (req, res) => {
    try {
        const db = await connectDB();

        const [products, users, orders] = await Promise.all([
            db.collection("products").find().sort({ addedOn: -1 }).toArray(),
            db.collection("users").find().toArray(),
            db.collection("orders").find().sort({ createdAt: -1 }).toArray()
        ]);

        const revenueResult = await db.collection("orders").aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]).toArray();

        const responseData = {
            revenue: revenueResult[0]?.total || 0,
            ordersCount: orders.length,
            usersCount: users.length,
            productsCount: products.length,
            recentProducts: products.slice(0, 5).map(product => {
                const { _id, details, available_colors, has_color_variants, stock, is_featured, ...rest } = product;
                return rest;
            }),
            recentOrders: orders.map(order => {
                const { _id, user_id, address, phone, ...rest } = order;
                return rest;
            })
        };

        res.json(responseData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard data',
            message: error.message
        });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const db = await connectDB();
        const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray()
        const filteredOrders = orders.map(({ _id, user_id, ...rest }) => rest);

        res.json(filteredOrders);
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({
            error: 'Failed to fetch Orders',
            message: error.message
        });
    }
});

router.get('/contacts', async (req, res) => {
    try {
        const db = await connectDB();
        const contacts = await db.collection("contacts").find().sort({ updatedAt: -1 }).toArray()
        const filteredContacts = contacts.map(({ _id, ...rest }) => rest);

        res.json(filteredContacts);
    } catch (error) {
        console.error('Contacts error:', error);
        res.status(500).json({
            error: 'Failed to fetch Contacts',
            message: error.message
        });
    }
});

router.get('/users', async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("users").find().toArray()
        const filteredUsers = users.map(({ _id, recentProducts, cart, ...rest }) => rest);

        res.json(filteredUsers);
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({
            error: 'Failed to fetch Users',
            message: error.message
        });
    }
});

// Get previous notification data
router.get('/variables/notifications', async (req, res) => {
    try {
        const db = await connectDB();
        const variable = await db.collection('variables')
            .findOne({ documentTitle: 'notifications' });

        if (!variable) {
            return res.json({
                success: true,
                recentOrders: [],
                contactMessages: []  // Stores all previous message timestamps
            });
        }

        res.json({
            success: true,
            recentOrders: variable.recentOrders || [],
            contactMessages: variable.contactMessages || []  // Array of message timestamps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notification data'
        });
    }
});

// Save current data as previous data
router.post('/variables/notifications', async (req, res) => {
    try {
        const { documentTitle, recentOrders, contactMessages } = req.body;
        const db = await connectDB();

        await db.collection('variables').updateOne(
            { documentTitle: 'notifications' },
            {
                $set: {
                    documentTitle,
                    recentOrders,
                    contactMessages,  // Store all message timestamps
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Notification data saved successfully'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Error saving notification data'
        });
    }
});

module.exports = router;