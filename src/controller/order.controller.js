import Order from "../model/orders.models.js";
import Product from "../model/products.models.js";  

// place oreder ------->>>>>>

const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id; // JWT se user ka ID le rahe hain        
        const { products } = req.body; // Frontend se sirf products aa rahe hain

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Products are required!" });
        }

        // Database se products fetch karo
        const productDetails = await Product.find({ _id: { $in: products.map(p => p.productId) } });

        if (!productDetails || productDetails.length === 0) {
            return res.status(404).json({ message: "Products not found!" });
        }

        // Price Calculation
        let totalPrice = 0;
        const productsWithSubtotal = products.map((item) => {
            const product = productDetails.find((p) => p._id.toString() === item.productId.toString());

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found!`);
            }

            const subTotal = product.price * item.quantity; 
            totalPrice += subTotal; 
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                subTotal
            };
        });

        // Order Save Karo
        const order = new Order({
            user: userId, // JWT se liya gaya user ID
            products: productsWithSubtotal,
            totalPrice,
            status: "pending"
        });

        await order.save();
        res.status(201).json({ message: "Order placed successfully!", order });

    } catch (error) {
        console.error("Error in placeOrder:", error.message);
        res.status(500).json({ message: error.message || "Something went wrong while placing the order!" });
    }
};



// Get all orders  ----->>>>>> 

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').populate('products.productId', 'name price');
        if (!orders.length) {
            return res.status(404).json({ message: "No orders found!" });
        }
        res.status(200).json({
            message: "Orders fetched successfully!",
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while fetching orders!" });
    }}



// Get single order by ID    ----->>>>>> 

const getSingleOrder = async (req, res) => {
    const { orderId } = req.params;  // Get orderId from request params
    console.log("Received Order ID:", orderId);

    try {
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('products.productId', 'name price');
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }
        res.status(200).json({
            message: "Order fetched successfully!",
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while fetching the order!" });
    }
};

export { placeOrder, getAllOrders ,getSingleOrder } ;


