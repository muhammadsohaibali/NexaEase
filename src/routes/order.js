const express = require("express");
const router = express.Router();

require("dotenv").config();

const sendNodeMail = require('../mailer/nodemailer');
const { orderPlacedTemplate } = require('../mailer/mailtemplates');

const { connectDB } = require('../config/connectmongo');
const restoreSessionMiddleware = require("../middlewares/restoreSession");

const { writeLog, getLogs } = require('../config/serverLogs');

function isValidOrderNumber(orderNumber) {
    return /^ne\d{10}[a-z0-9]{6}$/i.test(orderNumber);
}

function formatDate(date) {
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()} at ${date.toTimeString().slice(0, 8)}`;
}

// ==========================================================================================================

// Submit Order Route
router.post("/place-order", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;

    function generateOrderNumber(userId) {
        const timeZone = 'Asia/Karachi';
        const options = { timeZone, year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
        const now = new Intl.DateTimeFormat('en-US', options).format(new Date()).split(", ");
        const [date, time] = now;
        const [month, day, year] = date.split("/");
        const compactDate = `${day}${month}${year}`;
        const currentTime = time.replace(":", "");
        const userIdSuffix = userId.toString().slice(-6).toUpperCase();

        return `NE${compactDate}${currentTime}${userIdSuffix}`;
    }

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.cart || Object.keys(user.cart).length === 0) return res.status(400).json({ error: "Cart is empty" });

        const cartItems = await Promise.all(
            Object.entries(user.cart).map(async ([productId, details]) => {
                const product = await productsCollection.findOne({ product_id: productId });
                if (product) {
                    return {
                        product_id: productId,
                        product_name: product.product_name,
                        quantity: details.qty,
                        price: product.discounted_price,
                        img: product.imgs[0],
                        color: details.color ?? product.available_colors.split(',')[0]
                    };
                }
                return null;
            })
        );

        const validCartItems = cartItems.filter(item => item !== null);
        if (validCartItems.length === 0)
            return res.status(400).json({ error: "No valid products in cart" });

        const totalAmount = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const formattedDate = new Date().toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
            day: "numeric",
            month: "long",
            year: "numeric",
            hour12: false,
        });

        const orderId = generateOrderNumber(user._id)

        const newOrder = {
            orderNumber: orderId,
            user_id: user._id,
            email: user.email,
            items: validCartItems,
            total: totalAmount,
            status: "Pending",
            createdAt: formattedDate,
            username: user.fullName,
            address: user.address,
            phone: user.phoneNumber
        };

        await ordersCollection.insertOne(newOrder);
        await usersCollection.updateOne({ _id: user._id }, { $set: { cart: {} } });

        for (let product of newOrder.items) {
            const { product_id, quantity } = product

            await productsCollection.updateOne(
                { product_id: product_id },
                { $inc: { stock: -quantity } }
            )
        }

        try {
            await sendNodeMail(email, "NexaEase - Your Order Has Been Placed Successfully!", orderPlacedTemplate(newOrder));
            console.log(`Order Confirmation Sent To ${email} Successfully`);
            writeLog('info', `Order Confirmation Sent To ${email} Successfully`);
        } catch (error) {
            console.log(error)
            writeLog('error', `Error Sending Order Confirmation Email: ${error}`);
        }

        res.status(200).json({ message: "Order placed successfully!", orderId: orderId });
    } catch (error) {
        console.error("Error placing order:", error);
        writeLog('error', `Error placing order: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get orders by user email
router.get("/orders/user", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;

    try {
        const db = await connectDB();
        const ordersCollection = db.collection("orders");
        const orders = await ordersCollection.find({ email }).toArray();
        if (!orders.length) return res.status(404).json({ message: "No orders found for this user" });
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching orders by user:", error);
        writeLog('error', `Error fetching orders by user: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get order by order number
router.get("/orders/:orderNumber", async (req, res) => {
    const { orderNumber } = req.params;
    try {
        const db = await connectDB();
        const ordersCollection = db.collection("orders");
        const order = await ordersCollection.findOne({ orderNumber });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching order by order number:", error);
        writeLog('error', `Error fetching order by order number: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Cancel Order
router.post("/cancel-order/:orderNumber", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;
    const orderNumber = req.params.orderNumber;

    if (!isValidOrderNumber(orderNumber))
        return res.status(400).json({ message: "Invalid order number" });

    try {
        const db = await connectDB();
        const order = await db.collection("orders").findOne({ orderNumber, email });
        const productsCollection = db.collection("products");

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        if (order.status.toLowerCase() === "canceled")
            return res.status(400).json({ message: "Order is already canceled" });

        if (order.status.toLowerCase() !== "pending")
            return res.status(400).json({ message: "Order cannot be canceled" });

        await db.collection("orders").updateOne(
            { orderNumber },
            { $set: { status: "canceled", canceledAt: formatDate(new Date()) } }
        );

        for (let { product_id, quantity } of order.items) {
            await productsCollection.updateOne(
                { product_id: product_id },
                { $inc: { stock: +quantity } }
            )
        }

        return res.status(200).json({ message: "Order canceled successfully!" });
    } catch (err) {
        console.error("Cancel error:", err);
        writeLog('errors', `Error canceling order: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

