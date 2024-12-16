import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Adjust the path to your Firebase configuration
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./SalesComparisonChart.css"; // Create and style this CSS file if needed

const SalesComparisonChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1); // January 1st
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999); // December 31st

      try {
        // Query to fetch sales data for the current year
        const salesQuery = query(
          collection(db, "billing"),
          where("date", ">=", startOfYear),
          where("date", "<=", endOfYear)
        );

        const salesSnapshot = await getDocs(salesQuery);
        const monthlySalesTotals = calculateMonthlySales(salesSnapshot);

        setSalesData(monthlySalesTotals);
      } catch (error) {
        console.error("Error fetching sales data: ", error);
      }
    };

    fetchSalesData();
  }, []);

  // Function to calculate sales grouped by month
  const calculateMonthlySales = (snapshot) => {
    const monthlySales = Array(12).fill(0); // Initialize an array for 12 months

    snapshot.forEach((doc) => {
      const { date, totalAmount } = doc.data();
      const saleDate = date.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const monthIndex = saleDate.getMonth(); // Month index (0 for January, 11 for December)

      const total = parseFloat(totalAmount);
      monthlySales[monthIndex] += total; // Add to the respective month
    });

    // Format the data for the chart
    return monthlySales.map((sales, index) => ({
      name: new Date(0, index).toLocaleString("default", { month: "short" }), // Short month name (e.g., "Jan")
      Sales: sales,
    }));
  };

  return (
    <div className="chart-container">
      <h1 className="chart-header">Monthly Sales Comparison</h1>
      <ResponsiveContainer width="80%" height={400}>
        <BarChart
          data={salesData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Sales" fill="url(#colorSales)" animationDuration={1500} />
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesComparisonChart;
