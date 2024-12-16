import React, { useEffect, useState } from "react";
import { db } from "../firebase"; 
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import "./Dashboard.css";

const Cards = () => {
  const [billsCount, setBillsCount] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);

      const billsQuery = query(
        collection(db, "billing"), // Change 'billing' to your collection name
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp)
      );
      const billsSnapshot = await getDocs(billsQuery);
      setBillsCount(billsSnapshot.size);

      const todaySalesAmount = billsSnapshot.docs.reduce((total, doc) => total + doc.data().totalAmount, 0);
      setTodaySales(todaySalesAmount);

      const productsSnapshot = await getDocs(collection(db, "products"));
      setProductsCount(productsSnapshot.size);

      const customersSnapshot = await getDocs(collection(db, "customers"));
      setCustomersCount(customersSnapshot.size);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-box">
          <h2>Number of Bills</h2>
          <p>{billsCount}</p>
        </div>
        <div className="dashboard-box">
          <h2>Today's Sales Amount</h2>
          <p>₹{todaySales.toFixed(2)}</p>
        </div>
        <div className="dashboard-box">
          <h2>Number of Products</h2>
          <p>{productsCount}</p>
        </div>
        <div className="dashboard-box">
          <h2>Number of Customers</h2>
          <p>{customersCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Cards;
