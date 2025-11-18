import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./css/cashier.css";
import Footer from "../components/footer";
import { translations } from "../translations";


export default function Cashier({lang}) {
  const t = translations[lang];
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [comment, setComment] = useState("");
  const barcodeInputRef = useRef();
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [backendOrderNumber, setBackendOrderNumber] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const productsPerPage = 18;

  // Order info
  const date = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
    hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  useEffect(() => {
    fetchProducts();
   fetchCategories();
    fetchOrderNumber();
    barcodeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory);
  }, [currentPage, selectedCategory]);

  const handleCategoryChange = (cat) => {
  setSelectedCategory(cat);
  setCurrentPage(1); // reset page
};
const fetchCategories = async () => {
    try {
      // Fetch all products to extract categories
      const res = await axios.get("http://localhost:3000/products", {
        params: { page: 1, limit: 1000 }, // large limit to get all categories
      });
      const allCategories = ["All", ...new Set(res.data.products.map((p) => p.category))];
      setCategories(allCategories);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchProducts = async (page = 1, category = "All") => {
    try {
      const res = await axios.get("http://localhost:3000/products", {
        params: { page, limit: productsPerPage,  category: category === "All" ? undefined : category },
      });
      setProducts(res.data.products);
      setTotalProducts(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle barcode scanning
  const handleBarcodeScan = (code) => {
    const product = products.find((p) => p.code === code);
    if (!product) {
      return alert(t.productNotFound);
    }

    addProductToCart(product);
  };


  const addProductToCart = (product) => {
    if (product.quantity <= 0) return; // cannot add if out of stock

    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(
          cart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      } else {
        alert(t.noStockAvailable);
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // 👇 Auto-focus back to barcode input
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  };


  const increaseQty = (id) => {
    const product = products.find((p) => p.id === id);
    const cartItem = cart.find((p) => p.id === id);

    if (product && cartItem.quantity < product.quantity) {
      setCart(
        cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
      );
      // 👇 Auto-focus back to barcode input
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 0);
    } else {
      alert(t.noStockAvailable);
    }
  };

  const decreaseQty = (id) => {
    setCart(
      cart.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
      )
    );
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((p) => p.id !== id));
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  };

  const totalPrice = cart.reduce(
    (acc, p) => acc + p.quantity * p.priceForSale,
    0
  );

  // const filteredProducts =
  //   selectedCategory === "All"
  //     ? products
  //     : products.filter((p) => p.category === selectedCategory);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value) {
      handleBarcodeScan(e.target.value);
      e.target.value = "";
    }
  };
  const clearCart = () => {
    setCart([]);
    setComment("");
    barcodeInputRef.current?.focus();
  };
  // submit order
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert(t.cartEmpty);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/orders", {
        items: cart,
        total: totalPrice,
        comment,
        orderNumber,
      });

      const savedOrder = res.data;
      setBackendOrderNumber(savedOrder.orderNumber + 1); // store backend order number

      alert(t.orderSaved.replace("{orderNumber}", savedOrder.orderNumber));

      clearCart();
      fetchOrderNumber();
      fetchProducts(currentPage);
    } catch (err) {
      console.error(err);
      alert(t.failedSaveOrder);
    }
  };

  const fetchOrderNumber = async () => {
    try {
      const res = await axios.get("http://localhost:3000/orders/next-number");
      setOrderNumber(res.data);
    } catch (err) {
      console.error(err);
    alert(t.failedLoadOrderNumber);
    }
  };
return (
  <div className='cashier-page'>
    {/* LEFT: Cart Section */}
    <div className='cart-section'>
      <div className='cart-header'>
        <h3>
          {t.orderNumber}: {orderNumber !== null ? orderNumber : t.loading}
        </h3>
        <p>{date}</p>
      </div>

      <div className='barcode-input'>
        <input
          ref={barcodeInputRef}
          placeholder={t.scanBarcode}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className='cart-table'>
        <table>
          <thead>
            <tr>
              <th>{t.name}</th>
              <th>{t.qty}</th>
              <th>{t.price}</th>
              <th>{t.total}</th>
              <th>{t.remove}</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((p) => (
              <tr key={p.id}>
                <td className='name-cell'>{p.name}</td>
                <td>
                  <button onClick={() => decreaseQty(p.id)}>-</button>
                  <span className='qty'>{p.quantity}</span>
                  <button
                    onClick={() => increaseQty(p.id)}
                    disabled={
                      p.quantity >=
                      products.find((prod) => prod.id === p.id)?.quantity
                    }
                  >
                    +
                  </button>
                </td>
                <td>{p.priceForSale}</td>
                <td>{p.quantity * p.priceForSale}</td>
                <td>
                  <button
                    className='remove-btn'
                    onClick={() => removeFromCart(p.id)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='cart-footer'>
        <textarea
          placeholder={t.addComment}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <h3>{t.total}: {totalPrice}</h3>
        <button className='submit-order-btn' onClick={submitOrder}>
          {t.submitOrder}
        </button>
        <button className='clear-cart-btn' onClick={clearCart}>
          {t.clearCart}
        </button>
      </div>
    </div>

    {/* RIGHT: Products Section */}
    <div className='products-section'>
      <div className='categories-nav'>
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "selected" : ""}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className='products-grid'>
        {products.map((p) => (
          <div key={p.id} className='product-card'>
            <h4>{p.name}</h4>
            <p>{p.priceForSale} {t.LE}</p>
            <button
              className='add-btn'
              onClick={() => addProductToCart(p)}
              disabled={p.quantity <= 0} 
            >
              +
            </button>
            {p.quantity <= 0 && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>{t.outOfStock}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className='pagination'>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          {t.prev}
        </button>
        <span>
          {t.page} {currentPage} {t.of} {Math.ceil(totalProducts / productsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          {t.next}
        </button>
      </div>
    </div>
  </div>
);
}