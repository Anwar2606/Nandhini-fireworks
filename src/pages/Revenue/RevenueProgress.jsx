import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as per your setup
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Progress.css'; // Import CSS file for styling
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import icons for up and down arrows

const RevenueProgress = () => {
  const [todayTotalAmount, setTodayTotalAmount] = useState(0);
  const [yesterdayTotalAmount, setYesterdayTotalAmount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const targetAmount = 100000; // Example target amount for progress percentage calculation

  useEffect(() => {
    const fetchTotalAmounts = async () => {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      const todayBillingQuery = query(
        collection(db, 'customerBilling'),
        where('date', '>=', startOfToday),
        where('date', '<=', endOfToday)
      );

      const yesterdayBillingQuery = query(
        collection(db, 'customerBilling'),
        where('date', '>=', startOfYesterday),
        where('date', '<=', endOfYesterday)
      );

      try {
        // Fetch today's total amount
        const todayBillingSnapshot = await getDocs(todayBillingQuery);
        let totalAmountToday = 0;
        todayBillingSnapshot.forEach(doc => {
          const docData = doc.data();
          totalAmountToday += parseFloat(docData.totalAmount);
        });
        setTodayTotalAmount(totalAmountToday.toFixed(2));

        // Fetch yesterday's total amount
        const yesterdayBillingSnapshot = await getDocs(yesterdayBillingQuery);
        let totalAmountYesterday = 0;
        yesterdayBillingSnapshot.forEach(doc => {
          const docData = doc.data();
          totalAmountYesterday += parseFloat(docData.totalAmount);
        });
        setYesterdayTotalAmount(totalAmountYesterday.toFixed(2));

        // Calculate progress percentage
        const percentage = (totalAmountToday / targetAmount) * 100;
        setProgressPercentage(percentage.toFixed(2));
      } catch (error) {
        console.error('Error fetching total amounts: ', error);
      }
    };

    fetchTotalAmounts();
  }, []);

  return (
    <div className="progress-container">
      <h2 className='revenueTitle'>Today's Revenue Progress</h2>
      <div className="circular-progress-bar">
        <CircularProgressbar
          value={progressPercentage}
          text={`${progressPercentage}%`}
          styles={buildStyles({
            textColor: "#000", // Black text color
            pathColor: "#4d4dff",
            trailColor: "#f3f3f3"
          })}
        />
      </div>
      <div className="amount-comparison">
        <p className='revenueAmount'>
          Today: ₹{todayTotalAmount}
          {todayTotalAmount < yesterdayTotalAmount && (
            <span className="amountChange red">
              <FaArrowDown />
            </span>
          )}
        </p>
        <p className='revenueAmount'>
          Yesterday: ₹{yesterdayTotalAmount}
          {yesterdayTotalAmount > todayTotalAmount && (
            <span className="amountChange green">
              <FaArrowUp />
            </span>
          )}
        </p>
      </div>
      
    </div>
  );
};

export default RevenueProgress;
