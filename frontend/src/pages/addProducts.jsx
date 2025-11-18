import { useState, useRef, useEffect } from "react";
import "./css/addProducts.css";
import axios from "axios";
import Footer from "../components/footer";
import { translations } from "../translations";

export default function AddProducts({ username, lang }) {
  const t = translations[lang]; // choose the correct language

  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const barcodeInputRef = useRef();

  useEffect(() => {
    fetchCategories();
    barcodeInputRef.current?.focus();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:3000/products/categories");
    setCategories(res.data);
  };

  const clearFields = () => {
    setProductCode("");
    setName("");
    setQuantity("");
    setBuyPrice("");
    setSellPrice("");
    setSelectedCategory("");
  };

  const handleSubmit = async () => {
    const finalCategory = selectedCategory || "Others";

    if (!productCode || !name || !sellPrice || !quantity) {
      alert(t.fillRequired);
      return;
    }

    try {
      await axios.post("http://localhost:3000/products", {
        code: productCode,
        name,
        quantity,
        priceForSale: sellPrice,
        priceForBuying: buyPrice,
        category: finalCategory,
        addedby: username,
      });

      alert(t.productAdded);
      clearFields();
      barcodeInputRef.current.focus();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || t.addProductFailed);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
  };

  const handleAddCategory = async () => {
    const newCat = prompt(t.addCategoryPrompt);
    if (!newCat) return;

    try {
      await axios.post("http://localhost:3000/products/categories", {
        name: newCat,
      });
      fetchCategories();
      setSelectedCategory(newCat);
    } catch (err) {
      alert(err.response?.data?.message || t.addCategoryFailed);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-card">
        <h2>{t.addNewProduct}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="form-group">
            <label>{t.productCode}</label>
            <input
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder={t.scanBarcode}
              ref={barcodeInputRef}
            />
          </div>

          <div className="form-group">
            <label>{t.productName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.enterName}
            />
          </div>

          <div className="form-group">
            <label>{t.quantity}</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t.enterQuantity}
            />
          </div>

          <div className="form-group">
            <label>{t.buyingPrice}</label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder={t.enterBuyingPrice}
            />
          </div>

          <div className="form-group">
            <label>{t.sellingPrice}</label>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder={t.enterSellingPrice}
            />
          </div>

          <div className="category-section">
            <label>
              {t.category}
              <button
                type="button"
                onClick={handleAddCategory}
                className="add-category-btn"
                style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "16px", cursor: "pointer" }}
              >
                {t.addCategory}
              </button>
            </label>

            <div className="category-list">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-item ${selectedCategory === cat ? "selected" : ""}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="add-btn">{t.addProduct}</button>
            <button type="button" className="clear-btn" onClick={clearFields}>{t.clear}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
