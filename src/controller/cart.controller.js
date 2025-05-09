import Cart from '../model/cart.models.js';
import Product from '../model/products.models.js';

const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity, size } = req.body;

  if (!productId || !quantity || !size) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{
        productId,
        title: product.name,
        price: product.price,
        size,
        quantity,
        image: product.postImage,
      }]
    });
  } else {
    const index = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (index !== -1) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        title: product.name,
        price: product.price,
        size,
        quantity,
        image: product.postImage,
      });
    }
  }

  await cart.save();
  res.status(200).json({ message: 'Added to cart', cart });
};

const getCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(200).json({ cart: [] });
  res.status(200).json({ cart: cart.items });
};

const removeFromCart = async (req, res) => {
  const { productId, size } = req.body;
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(
    item => !(item.productId.toString() === productId && item.size === size)
  );

  await cart.save();
  res.status(200).json({ message: 'Removed from cart', cart: cart.items });
};

const updateCartQuantity = async (req, res) => {
  const { productId, size, quantity } = req.body;
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(
    item => item.productId.toString() === productId && item.size === size
  );

  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.quantity = quantity;
  await cart.save();
  res.status(200).json({ message: 'Quantity updated', cart: cart.items });
};

const checkout = async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Payment processing logic yahan aayega...

  cart.items = [];
  await cart.save();

  res.status(200).json({ message: 'Checkout successful', cart: [] });
};

// ✅ Grouped Export
export {
  addToCart,getCart,removeFromCart,updateCartQuantity,checkout};
