import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as per your setup
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faBox, faRupeeSign, faFileInvoiceDollar, faCalendar } from '@fortawesome/free-solid-svg-icons';
import './Grid.css'; // Import CSS file for styling

const Grid = () => {
  const [numberOfCustomerBills, setNumberOfCustomerBills] = useState(0);
  const [numberOfBillingBills, setNumberOfBillingBills] = useState(0);
  const [numberOfProducts, setNumberOfProducts] = useState(0);
  const [todayCustomerTotalAmount, setTodayCustomerTotalAmount] = useState(0);
  const [todayBillingTotalAmount, setTodayBillingTotalAmount] = useState(0);
  const [latestInvoiceNumber, setLatestInvoiceNumber] = useState('');

  useEffect(() => {
    // Fetch number of bills in customerBilling collection
    const fetchNumberOfBillingBills = async () => {
      const billingSnapshot = await getDocs(collection(db, 'billing'));
      const customerBillingSnapshot = await getDocs(collection(db, 'customerBilling'));
      
      const uniqueInvoiceNumbers = new Set();
    
      billingSnapshot.forEach(doc => {
        const invoiceNumber = doc.data().invoiceNumber; // Assuming 'invoiceNumber' is the unique field
        uniqueInvoiceNumbers.add(invoiceNumber);
      });
    
      customerBillingSnapshot.forEach(doc => {
        const invoiceNumber = doc.data().invoiceNumber; // Assuming 'invoiceNumber' is the unique field
        uniqueInvoiceNumbers.add(invoiceNumber);
      });
    
      setNumberOfBillingBills(uniqueInvoiceNumbers.size); // Set total number of unique bills from both collections
    };
    const fetchTodayTotalAmounts = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Query for today's records in customerBilling collection
      const todayCustomerBillingQuery = query(
        collection(db, 'customerBilling'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );

      // Query for today's records in billing collection
      const todayBillingQuery = query(
        collection(db, 'billing'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );

      try {
        // Fetch and process today's customerBilling records
        const customerBillingSnapshot = await getDocs(todayCustomerBillingQuery);
        let customerTotalAmount = 0;

        customerBillingSnapshot.forEach(doc => {
          const docData = doc.data();
          customerTotalAmount += parseFloat(docData.totalAmount); // Accumulate totalAmount as float
        });

        setTodayCustomerTotalAmount(customerTotalAmount.toFixed(2)); // Set customerBilling totalAmount rounded to 2 decimal places

        // Fetch and process today's billing records
        const billingSnapshot = await getDocs(todayBillingQuery);
        let billingTotalAmount = 0;

        billingSnapshot.forEach(doc => {
          const docData = doc.data();
          billingTotalAmount += parseFloat(docData.totalAmount); // Accumulate totalAmount as float
        });

        setTodayBillingTotalAmount(billingTotalAmount.toFixed(2)); // Set billing totalAmount rounded to 2 decimal places

      } catch (error) {
        console.error('Error fetching today total amounts: ', error);
      }
    };

    // Fetch latest invoice number
    const fetchLatestInvoiceNumber = async () => {
      try {
        // Define query to get the latest invoice from the 'billing' collection
        const billingQuery = query(
          collection(db, 'billing'),
          orderBy('invoiceNumber', 'desc'),
          limit(1)
        );
    
        // Fetch the latest invoice
        const billingSnapshot = await getDocs(billingQuery);
        let latestNumber = '';
    
        // Check if the snapshot is not empty and get the latest invoice number
        if (!billingSnapshot.empty) {
          latestNumber = billingSnapshot.docs[0].data().invoiceNumber;
        }
    
        setLatestInvoiceNumber(latestNumber); // Set the latest invoice number
      } catch (error) {
        console.error('Error fetching latest invoice number:', error);
      }
    };
    

    fetchNumberOfBillingBills();
    // fetchNumberOfProducts();
    fetchTodayTotalAmounts();
    fetchLatestInvoiceNumber();
  }, []);

  return (
    <div className="metrics-dashboard">
      <div className="metric-card atm-card">
        <FontAwesomeIcon icon={faFileInvoice} size="2x" />
        <h2 className="animated-text">Number of Bills</h2>
        <p className="animated-text">{numberOfBillingBills}</p>
      </div>
      <div className="metric-card atm-card">
        <FontAwesomeIcon icon={faFileInvoice} size="2x" />
        <h2 className="animated-text">Number of Customer Bills</h2>
        <p className="animated-text">{numberOfCustomerBills}</p>
      </div>
      {/* <div className="metric-card atm-card">
        <FontAwesomeIcon icon={faBox} size="2x" />
        <h2 className="animated-text">Number of Products</h2>
        <p className="animated-text">{numberOfProducts}</p>
      </div> */}
      <div className="metric-card atm-card">
        <FontAwesomeIcon icon={faRupeeSign} size="2x" />
        <h2 className="animated-text">Today's Customer Total Amount</h2>
        <p className="animated-text">₹{todayCustomerTotalAmount}</p>
      </div>
      <div className="metric-card atm-card">
        <FontAwesomeIcon icon={faFileInvoiceDollar} size="2x" />
        <h2 className="animated-text">Today's Billing Total Amount</h2>
        <p className="animated-text">₹{todayBillingTotalAmount}</p>
      </div>
    </div>
  );
};

export default Grid;
