import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SalesComparisonChart from '../Chart/SalesComparisonChart';
import Grid from '../Grid/Grid';

const TodaySales = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null); // Track currently editing detail

  const fetchDetails = async () => {
    setLoading(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const detailsQuery = query(
      collection(db, 'billing'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );

    try {
      const querySnapshot = await getDocs(detailsQuery);
      const detailsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDetails(detailsData);
    } catch (error) {
      console.error('Error fetching details: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [selectedDate]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'customerBilling', id));
      setDetails(prevDetails => prevDetails.filter(detail => detail.id !== id));
      console.log('Document successfully deleted!');
      fetchDetails(); // Fetch details again after deletion
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleEdit = (detail) => {
    setEditingDetail(detail); // Set the detail currently being edited
  };

  const handleSave = async () => {
    try {
      const { id, customerName, totalAmount } = editingDetail;
      await updateDoc(doc(db, 'billing', id), {
        customerName,
        totalAmount
      });
      console.log('Document successfully updated!');
      setEditingDetail(null); // Clear editing state
      fetchDetails(); // Fetch details again after update
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingDetail(null); // Clear editing state
  };

  const handleGeneratePDF = (detail) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Invoice Details', 14, 20);
    doc.setFontSize(12);
    doc.text(`Customer Name: ${detail.customerName}`, 14, 28);
    doc.text(`Invoice Number: ${detail.invoiceNumber}`, 14, 36);

    // Prepare table data
    const tableBody = detail.productsDetails.map(item => [
      item.name || 'N/A',
      item.quantity || 'N/A',
      `₹${item.price ? item.price.toFixed(2) : 'N/A'}`,
      `₹${item.quantity && item.price ? (item.quantity * item.price).toFixed(2) : 'N/A'}`
    ]);

    // Calculate Total Amount, Discounted Amount, and Grand Total
    const totalAmount = detail.totalAmount ? `₹${detail.totalAmount.toFixed(2)}` : 'N/A';
    const discountedAmount = detail.discountedTotal ? `₹${detail.discountedTotal.toFixed(2)}` : 'N/A';
    const grandTotal = detail.grandTotal ? `₹${detail.grandTotal.toFixed(2)}` : 'N/A';

    // Add table and totals to PDF
    doc.autoTable({
      head: [['Product Name', 'Quantity', 'Price', 'Total Amount']],
      body: tableBody,
      startY: 50,
      theme: 'grid', // Use 'grid' theme for borders
      styles: {
        cellPadding: 2,
        fontSize: 10,
        valign: 'middle',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      headStyles: {
        fillColor: [204, 204, 204],
        textColor: [0, 0, 0],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        halign: 'right',
        valign: 'middle'
      }
    });

    // Add Total Amount, Discounted Amount, and Grand Total to the table
    doc.autoTable({
      body: [
        ['Total Amount', totalAmount],
        ['Discounted Amount', discountedAmount],
        ['Grand Total', grandTotal]
      ],
      startY: doc.autoTable.previous.finalY + 10,
      theme: 'grid', // Use 'grid' theme for borders
      styles: {
        cellPadding: 2,
        fontSize: 10,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [204, 204, 204],
        textColor: [0, 0, 0],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        halign: 'right',
        valign: 'middle'
      }
    });

    // Save PDF
    doc.save(`invoice_${detail.invoiceNumber}.pdf`);
  };

  return (
    <div>
      <Grid />
      <SalesComparisonChart />
      <h2>Details By Date</h2>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        className="custom-datepicker"
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          {details.length === 0 ? (
            <p>No details recorded on this date.</p>
          ) : (
            <table className="details-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Discount Amount</th>
                  <th>CGST Amount</th>
                  <th>SGST Amount</th>
                  <th>IGST Amount</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {details.map(detail => (
                  <tr key={detail.id}>
                    <td>
                      {editingDetail && editingDetail.id === detail.id ? (
                        <input
                          type="text"
                          value={editingDetail.customerName}
                          onChange={(e) => setEditingDetail({ ...editingDetail, customerName: e.target.value })}
                        />
                      ) : (
                        detail.customerName
                      )}
                    </td>
                    <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
                    <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
                    <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
                    <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
                    <td>
                      {editingDetail && editingDetail.id === detail.id ? (
                        <input
                          type="text"
                          value={editingDetail.totalAmount}
                          onChange={(e) => setEditingDetail({ ...editingDetail, totalAmount: e.target.value })}
                        />
                      ) : (
                        `₹${detail.totalAmount}`
                      )}
                    </td>
                    <td>{new Date(detail.date.seconds * 1000).toLocaleString()}</td>
                    <td>
                      {editingDetail && editingDetail.id === detail.id ? (
                        <>
                          <button onClick={handleSave}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(detail)}>Edit</button>
                      )}
                      <button onClick={() => handleDelete(detail.id)}>Delete</button>
                      <button onClick={() => handleGeneratePDF(detail)}>Generate PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default TodaySales;
