const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for orders (no database)
let orders = [];

// Mock menu data
const menuData = {
    appetizers: [
        { id: 1, name: "Chicken Wings", price: 8.99, description: "Crispy wings with BBQ sauce" },
        { id: 2, name: "Mozzarella Sticks", price: 6.99, description: "Golden fried cheese sticks" },
        { id: 3, name: "Spring Rolls", price: 5.99, description: "Vegetable spring rolls" }
    ],
    mainCourses: [
        { id: 4, name: "Classic Burger", price: 12.99, description: "Beef patty with cheese and veggies" },
        { id: 5, name: "Pepperoni Pizza", price: 14.99, description: "Large pizza with pepperoni" },
        { id: 6, name: "Chicken Pasta", price: 13.99, description: "Creamy alfredo pasta" },
        { id: 7, name: "Grilled Steak", price: 18.99, description: "Premium ribeye steak" }
    ],
    desserts: [
        { id: 8, name: "Chocolate Cake", price: 5.99, description: "Rich chocolate layer cake" },
        { id: 9, name: "Ice Cream Sundae", price: 4.99, description: "Vanilla ice cream with toppings" },
        { id: 10, name: "Cheesecake", price: 6.99, description: "New York style cheesecake" }
    ],
    beverages: [
        { id: 11, name: "Coca Cola", price: 2.99, description: "Chilled soft drink" },
        { id: 12, name: "Fresh Orange Juice", price: 3.99, description: "Freshly squeezed" },
        { id: 13, name: "Iced Coffee", price: 4.99, description: "Cold brew coffee" }
    ]
};

// Routes

// Get menu
app.get('/api/menu', (req, res) => {
    res.json(menuData);
});

// Create order (this endpoint can be used instead of direct n8n webhook)
app.post('/api/orders', (req, res) => {
    const order = {
        ...req.body,
        id: orders.length + 1,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    
    console.log('New order received:', order);
    
    res.json({
        success: true,
        order: order,
        message: 'Order placed successfully'
    });
});

// Get all orders (for admin panel)
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.orderId === req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    const order = orders.find(o => o.orderId === req.params.id);
    if (order) {
        order.status = req.body.status;
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('In-memory storage active - orders will be lost on restart');
});
