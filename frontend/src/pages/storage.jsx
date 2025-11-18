import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./css/storage.css";
import Footer from "../components/footer";
import { translations } from "../translations";


export default function Storage({ username, lang }) {
  const t = translations[lang];
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const SearchFilterRef = useRef();
  const [categories, setCategories] = useState([]);

  const productsPerPage = 30;
    const fetchCategories = async () => {
    const res = await axios.get("http://localhost:3000/products/categories");
    setCategories(res.data);
  };
  const fetchProducts = async () => {
  try {
    const res = await axios.get("http://localhost:3000/products", {
      params: {
        page: currentPage,
        limit: productsPerPage,
        search: searchTerm,
        sort: "ASC", // small quantity first
        category: categoryFilter || ""
      }
    });

    setProducts(res.data.products); // backend returns { products, total }
    setTotal(res.data.total);       // total products
  } catch (err) {
    console.error(t.fetchProductsFailed, err);
  }
};


useEffect(() => {
  fetchProducts();
  fetchCategories();
  SearchFilterRef.current?.focus();
}, [currentPage, searchTerm, categoryFilter]);


  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm))
      return;
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      fetchProducts();
       setTimeout(() => {
      SearchFilterRef.current?.focus();
    }, 0);
    } catch (err) {
      console.error(err);
      alert(t.deleteFailed);
    }
  };

  // Start editing
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditedProduct({ ...product });
  };

  // Save edited product
  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:3000/products/${id}`, editedProduct);
      setEditingId(null);
      fetchProducts();
             setTimeout(() => {
      SearchFilterRef.current?.focus();
    }, 0);
    } catch (err) {
      console.error(err);
     alert(t.updateFailed);
    }
  };
  
    const totalPages = Math.ceil(total / productsPerPage);

return (
  <div className='storage-page'>
    <h2>{t.productStorage}</h2>
    <div className='filters'>
      <input
        type='text'
        ref={SearchFilterRef}
        placeholder={t.searchByNameOrID}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className='search-input'
      />

      <select
        value={categoryFilter}
        onChange={(e) => {
          setCategoryFilter(e.target.value);
          setCurrentPage(1);
        }}
        className='filter-select'
      >
        <option value=''>{t.allCategories}</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>

    <table className='storage-table'>
      <thead>
        <tr>
          <th>{t.code}</th>
          <th>{t.name}</th>
          <th>{t.quantity}</th>
          <th>{t.buyingPrice}</th>
          <th>{t.sellingPrice}</th>
          <th>{t.category}</th>
          <th>{t.addedBy}</th>
          <th>{t.actions}</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td style={{ wordWrap: "break-word", maxWidth: "120px" }}>
              {editingId === p.id ? (
                <input
                  value={editedProduct.code}
                  onChange={(e) =>
                    setEditedProduct({ ...editedProduct, code: e.target.value })
                  }
                  style={{
                    width: "100%",
                    background: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                    padding: "4px",
                  }}
                />
              ) : (
                p.code
              )}
            </td>
            <td style={{ wordWrap: "break-word", maxWidth: "120px" }}>
              {editingId === p.id ? (
                <input
                  value={editedProduct.name}
                  onChange={(e) =>
                    setEditedProduct({ ...editedProduct, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    background: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                    padding: "4px",
                  }}
                />
              ) : (
                p.name
              )}
            </td>
            <td className={p.quantity < 15 ? "low-stock" : ""}>
              {editingId === p.id ? (
                <input
                  type='number'
                  value={editedProduct.quantity}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      quantity: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid #555",
                    padding: "4px",
                    color: "white",
                  }}
                />
              ) : (
                <span>{p.quantity}</span>
              )}
            </td>
            <td>
              {editingId === p.id ? (
                <input
                  type='number'
                  value={editedProduct.priceForBuying}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      priceForBuying: e.target.value,
                    })
                  }
                />
              ) : (
                p.priceForBuying
              )}
            </td>
            <td>
              {editingId === p.id ? (
                <input
                  type='number'
                  value={editedProduct.priceForSale}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      priceForSale: e.target.value,
                    })
                  }
                />
              ) : (
                p.priceForSale
              )}
            </td>
            <td>
              {editingId === p.id ? (
                <select
                  value={editedProduct.category}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      category: e.target.value,
                    })
                  }
                  className='edit-select'
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                p.category
              )}
            </td>
            <td>{p.addedby}</td>
            <td>
              {editingId === p.id ? (
                <>
                  <button className='save-btn' onClick={() => handleSave(p.id)}>
                    {t.save}
                  </button>
                  <button className='cancel-btn' onClick={() => setEditingId(null)}>
                    {t.cancel}
                  </button>
                </>
              ) : (
                <>
                  <button className='edit-btn' onClick={() => handleEdit(p)}>
                    {t.edit}
                  </button>
                  <button className='delete-btn' onClick={() => handleDelete(p.id)}>
                    {t.delete}
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className='pagination'>
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        {t.prev}
      </button>

      <span style={{ margin: "0 10px" }}>
        {t.pageOf} {currentPage} {t.of} {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        {t.next}
      </button>
    </div>
  </div>
);
}
