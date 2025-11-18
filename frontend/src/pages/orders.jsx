import { useState, useEffect } from "react";
import axios from "axios";
import "./css/orders.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { translations } from "../translations";


export default function OrdersPage({lang }) {
    const t = translations[lang]; // shortcut for current language
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [searchOrder, setSearchOrder] = useState("");
  const [searchComment, setSearchComment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

   // Date range defaults to today
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
const [totalAmount, setTotalAmount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const limit = 30; // 30 orders per page

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchOrder, searchComment, startDate, endDate]);




  const fetchOrders = async () => {
    try {

        // Convert to Egyptian time if needed (optional)
    console.log("Fetching orders with:");
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
      const res = await axios.get("http://localhost:3000/orders/search", {
        params: {
          page: currentPage,
          limit,
          orderNumber: searchOrder,
          comment: searchComment,
          startDate,
          endDate,
        },
      });

      setOrders(res.data.data);
      
      setTotalPages(res.data.totalPages);
     // Set total amount and profit from backend
      setTotalAmount(res.data.totalAmount || 0);
      setTotalProfit(res.data.totalProfit || 0);
    } catch (err) {
      console.error(err);
    }
  };
 const handleReturn = async (orderId, item) => {
    const quantityToReturn = parseInt(
      prompt(`Enter quantity to return (max ${item.quantity}):`, "1")
    );

    if (!quantityToReturn || quantityToReturn <= 0 || quantityToReturn > item.quantity) {
      alert("Invalid quantity");
      return;
    }

    try {
      await axios.post("http://localhost:3000/orders/return-item", {
        orderId,
        itemId: item.id,
        quantity: quantityToReturn,
      });

      alert(`Returned ${quantityToReturn} of ${item.name}`);
      fetchOrders(); // refresh orders to update totals and item states
    } catch (err) {
      console.error(err);
      alert("Failed to return item");
    }
  };
const exportToExcel = () => {
  // Flatten orders so each item is a separate row
  const data = [];

  orders.forEach((order) => {
    order.items.forEach((item) => {
      data.push({
        "Order #": order.orderNumber,
        Date: order.date + " " + order.time,
        "Added By": item.addedby || "Unknown",
        Comment: order.comment || "-",
        "Item Name": item.name,
        Qty: item.quantity,
        "Price per Item": item.priceForSale,
        "Total": item.quantity * item.priceForSale,
        "Order Total": order.total,
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Optionally, set column widths for better readability
  const wsCols = [
    { wch: 12 }, // Order #
    { wch: 20 }, // Date
    { wch: 15 }, // Added By
    { wch: 25 }, // Comment
    { wch: 20 }, // Item Name
    { wch: 8 },  // Qty
    { wch: 12 }, // Price per Item
    { wch: 12 }, // Total
    { wch: 12 }, // Order Total
  ];
  worksheet["!cols"] = wsCols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Orders_${startDate}_to_${endDate}.xlsx`);
};


  return (
    <div className="orders-page">
      <h1>{t.allOrders}</h1>

      {/* SEARCH + DATE FILTERS */}
      <div className="search-bar">
        <div className="left-filters">
          <input
            type="text"
            placeholder={t.searchOrder}
            value={searchOrder}
            onChange={(e) => {
              setSearchOrder(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="text"
            placeholder={t.searchComment}
            value={searchComment}
            onChange={(e) => {
              setSearchComment(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="right-filters">
          <label>
            {t.from}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <label>
            {t.to}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
        </div>
      </div>

      {/* TOTALS */}
      <div className="totals-bar">
        <span>
          {t.totalAmount}: {totalAmount.toFixed(2)} EGP
        </span>
        <span>
          {t.totalProfit}: {totalProfit.toFixed(2)} EGP
        </span>
        <button className="export-btn" onClick={exportToExcel}>
          {t.exportExcel}
        </button>
      </div>

      {/* ORDERS TABLE */}
      <table className="orders-table">
        <thead>
          <tr>
            <th>{t.orderNumber}</th>
            <th>{t.dateTime}</th>
            <th>{t.addedBy}</th>
            <th>{t.comment}</th>
            <th>{t.totalPrice}</th>
            <th>{t.details}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <>
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.date + " - " + order.time}</td>
                <td>{order.items[0]?.addedby || "Unknown"}</td>
                <td>{order.comment || "-"}</td>
                <td>{order.total} EGP</td>
                <td>
                  <button
                    className="details-btn"
                    onClick={() =>
                      setExpanded(
                        expanded === order.orderNumber ? null : order.orderNumber
                      )
                    }
                  >
                    {expanded === order.orderNumber ? t.hide : t.view}
                  </button>
                </td>
              </tr>

              {expanded === order.orderNumber && (
                <tr className="details-row">
                  <td colSpan="6">
                    <div className="items-box">
                      <h3>{t.items}</h3>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>{t.name}</th>
                            <th>{t.qty}</th>
                            <th>{t.price}</th>
                            <th>{t.total}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.priceForSale}</td>
                              <td>{item.quantity * item.priceForSale}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          {t.prev}
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}