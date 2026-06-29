import { inngest } from "../inngest/index.js";
import { prisma } from "../config/prisma.js";
//create order
//post/api/orders
export const createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    //check the items is empty or not
    if (!items || items.length === 0) {
        res.status(400).json({ message: "items is empty" });
    }
    //look up the actual price from the database
    const productIds = items.map((i) => i.product);
    const product = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = {};
    product.forEach((p) => (productMap[p.id] = p));
    //check if the product is in stocks
    for (const item of items) {
        const product = productMap[item.product];
        if (!product || (product.stock ?? 0) < item.quantity) {
            return res.status(404).json({ message: "product out of stock" });
        }
    }
    const orderItems = items.map((item) => {
        const dbProduct = productMap[item.product];
        if (!dbProduct) {
            throw new Error(`Product ${item.product} not found`);
        }
        return {
            product: dbProduct.id,
            name: dbProduct.name,
            image: dbProduct.image,
            price: dbProduct.price,
            quantity: item.quantity,
            unit: dbProduct.unit,
        };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 20 ? 0 : 1.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    const order = await prisma.order.create({
        data: {
            userId: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            deliveryFee,
            tax,
            total,
            statusHistory: [
                {
                    status: "Placed",
                    timestamp: new Date(),
                },
            ]
        }
    });
    if (paymentMethod === "card") {
        //stripe payment link
    }
    res.json({ order });
    //Decrease stock
    for (const item of orderItems) {
        await prisma.product.update({
            where: { id: items.product },
            data: { stock: { decrement: item.quantity } }
        });
    }
    // Send stock update events for each product in the order
    for (const item of orderItems) {
        await inngest.send({
            name: "inventory/stock.updated",
            data: { productId: item.product },
        });
    }
    // Send order placed event
    await inngest.send({
        name: "order/placed",
        data: { orderId: order.id },
    });
};
//get user orders
//get/api/order
export const getUserOrder = async (req, res) => {
    const { status } = req.query;
    const where = {
        userId: req.user.id,
        // Exclude orders where payment method is "card"
        // and the payment has not been completed
        NOT: [{ paymentMethod: "card", isPaid: false }]
    };
    // Exclude orders where payment method is "card"
    // and the payment has not been completed
    if (status && status !== "all") {
        where.status = status;
    }
    // Fetch the orders from the database
    const orders = await prisma.order.findMany({
        where,
        // Include delivery partner information
        include: { deliveryPartner: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
};
// Get Single Order
// GET /api/orders/:id
export const getOrder = async (req, res) => {
    // Find the order in the database
    const order = await prisma.order.findFirst({
        // Search for the order whose:
        // 1. ID matches the URL parameter
        // 2. User ID matches the logged-in user
        where: { id: req.params.id, userId: req.user.id, },
        // Include delivery partner details
        include: { deliveryPartner: { select: {
                    name: true,
                    phone: true,
                    avatar: true,
                    vehicleType: true
                } } },
    });
    // If no matching order is found
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    res.json({ order });
};
// Update Order Status (Admin)
// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    // Get the status and note from the request body
    const { status, note } = req.body;
    // Find the order by its ID
    const order = await prisma.order.findUnique({
        where: {
            id: req.params.id,
        },
    });
    // Check if the order exists
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    // Get the existing status history
    const history = (Array.isArray(order.statusHistory)
        ? order.statusHistory : []);
    // Add the new status to the history
    history.push({
        status,
        note: note || `Order ${status.toLowerCase()}`,
        timestamp: new Date(),
    });
    // Update the order
    const updatedOrder = await prisma.order.update({
        where: {
            id: req.params.id,
        },
        data: {
            status,
            statusHistory: history,
        },
    });
    // Return the updated order
    res.json({
        order: updatedOrder,
    });
};
//get all orders
//get/api/order
export const getAllOrders = async (req, res) => {
    // Fetch the orders from the database
    const orders = await prisma.order.findMany({
        where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        // Include delivery partner information
        include: {
            user: { select: { name: true, email: true } },
            deliveryPartner: { select: { name: true, phone: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
};
// Get Order Location
// GET /api/orders/:id/location
export const getOrderLocation = async (req, res) => {
    // Find the order by ID and make sure it belongs to the logged-in user
    const order = await prisma.order.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id,
        },
        // Return only the live location and current status
        select: {
            liveLocation: true,
            status: true,
        },
    });
    // If the order doesn't exist, return a 404 response
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    // Send the live location and order status to the frontend
    res.json({
        liveLocation: order.liveLocation,
        status: order.status,
    });
};
