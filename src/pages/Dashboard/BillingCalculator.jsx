import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the initialized firebase instance
import { collection, getDocs, addDoc, Timestamp, setDoc, getDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BillingCalculator.css'; // Import the CSS file
import Navbar from '../Navbar/Navbar';

const BillingCalculator = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTermForCustomers, setSearchTermForCustomers] = useState('');

  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [category, setCategory] = useState('');
  let invoiceNumber = ''; 
  const [billingDetails, setBillingDetails] = useState({
    totalAmount: 0,
    discountPercentage: '',
    discountedTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
  });
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhoneNo, setCustomerPhone] = useState('');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerPan, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Track if the search term exists
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [currentDate, setCurrentDate] = useState(new Date()); // State for current date
  const [showCustomerDetails, setShowCustomerDetails] = useState(false); // State for toggling customer details
  const handleInvoiceNumberChange = (event) => {
    setManualInvoiceNumber(event.target.value);
  };



  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollectionRef = collection(db, 'products');
      try {
        const querySnapshot = await getDocs(productsCollectionRef);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };
    fetchProducts();
  }, []);


  useEffect(() => {
    const filterProducts = () => {
      let filtered = products;
      if (searchTerm) {
        filtered = filtered.filter(product => {
          const productName = product.name ? product.name.toLowerCase() : '';
          const productCode = product.sno ? product.sno.toLowerCase() : '';
          return productName.includes(searchTerm.toLowerCase()) || productCode.includes(searchTerm.toLowerCase());
        });
      }
      setFilteredProducts(filtered);
    };
    filterProducts();
  }, [searchTerm, products]);


  useEffect(() => {
    const fetchCustomers = async () => {
      let customersQuery = collection(db, 'customer');

      // If search term exists, query for customers whose name starts with the search term
      if (searchTermForCustomers) {
        customersQuery = query(
          customersQuery,
          where('customerName', '>=', searchTermForCustomers),
          where('customerName', '<=', searchTermForCustomers + '\uf8ff') // Lexicographic range query
        );
      }

      try {
        const snapshot = await getDocs(customersQuery);
        const customersData = snapshot.docs.map(doc => doc.data());
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [searchTermForCustomers]);

  // Filter customers in memory after fetching data
  useEffect(() => {
    const filterCustomers = () => {
      let filtered = customers;

      if (searchTermForCustomers) {
        filtered = filtered.filter(customer => {
          const customerName = customer.customerName ? customer.customerName.toLowerCase() : '';
          return customerName.includes(searchTermForCustomers.toLowerCase());
        });
      }

      setFilteredCustomers(filtered);
      setIsSearching(searchTermForCustomers !== ''); // Update the search state
    };

    filterCustomers();
  }, [customers, searchTermForCustomers]);

  
  const handleCustomerClick = (customer) => {
    setCustomerName(customer.customerName);
    setCustomerAddress(customer.customerAddress);
    setCustomerState(customer.customerState);
    setCustomerPhone(customer.customerPhoneNo);
    setCustomerGSTIN(customer.customerGSTIN);
    setCustomerPAN(customer.customerPan);
    setCustomerEmail(customer.customerEmail);
  };
  

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: parseInt(quantity, 10) || 0 }
        : item
    );
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };
  
  const updateBillingDetails = (updatedCart) => {
    const totalAmount = updatedCart.reduce((total, item) => {
      return total + (item.saleprice * item.quantity);
    }, 0);

    const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
    const discountedTotal = totalAmount * (1 - discountPercentage / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxOption === 'cgst_sgst') {
      if (customerState === businessState) {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      } else {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      }
    } else if (taxOption === 'igst') {
      igstAmount = discountedTotal * 0.18;
    }

    const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

    setBillingDetails(prevState => ({
      ...prevState,
      totalAmount,
      discountedTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grandTotal,
    }));
  };
  const updateProductQuantity = async (productId, purchaseQuantity) => {
    const productRef = doc(db, 'products', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const newQuantity = product.quantity - purchaseQuantity;
      if (newQuantity < 0) {
        alert('Not enough stock available.');
        return;
      }
      await updateDoc(productRef, { quantity: newQuantity });
    }
  };

  const handleDiscountChange = (event) => {
    const discountPercentage = event.target.value;
    setBillingDetails(prevState => ({
      ...prevState,
      discountPercentage,
    }));
  };
  const ClearAllData =() => {
    window.location.reload();
  };

  useEffect(() => {
    updateBillingDetails(cart);
  }, [billingDetails.discountPercentage, customerState, taxOption]);
  function numberToWords(num) {
    const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    function convertHundreds(num) {
        let str = '';
        if (num > 99) {
            str += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num > 19) {
            str += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 9) {
            str += teens[num - 10] + ' ';
        } else if (num > 0) {
            str += ones[num] + ' ';
        }
        return str.trim();
    }

    function convertToWords(n) {
        if (n === 0) return 'Zero';

        let words = '';

        let i = 0;
        while (n > 0) {
            let rem = n % 1000;
            if (rem !== 0) {
                words = convertHundreds(rem) + ' ' + thousands[i] + ' ' + words;
            }
            n = Math.floor(n / 1000);
            i++;
        }
        return words.trim();
    }

    // Split the number into rupees and paise
    const rupees = Math.floor(num);
    // const paise = Math.round((num - rupees) * 100); // Not used as paise are ignored

    return convertToWords(rupees);
}



function formatGrandTotal(amount) {
  return `${Math.floor(amount).toString()}.00`;
}
const saveBillingDetails = async (newInvoiceNumber) => {
const invoiceNumber = manualInvoiceNumber.trim();
// if (!invoiceNumber) {
//   alert('Please enter a valid invoice number.');
//   return; // Exit the function if the invoice number is empty
// }
cart.forEach(async (item) => {
  await updateProductQuantity(item.productId, item.quantity);
});

const billingDocRef = collection(db, 'billing');
try {
  await addDoc(billingDocRef, {
    ...billingDetails,
    customerName,
    customerAddress,
    customerState,
    customerPhoneNo,
    customerEmail,
    customerGSTIN,
   
    productsDetails: cart.map(item => ({
      productId: item.productId,
      name: item.name,
      saleprice: item.saleprice,
      quantity: item.quantity
    })),
    createdAt: Timestamp.fromDate(selectedDate),
    invoiceNumber, // Use the same invoice number
  });
    console.log('Billing details saved successfully in Firestore');
} catch (error) {
    console.error('Error saving billing details: ', error);
}
};


const generatePDF = (copyType, invoiceNumber) => {
  const doc = new jsPDF();
  const copies = ['Transport Copy', 'Office Copy', 'Customer Copy', 'Sales Copy'];
  copies.forEach((copyType, index) => {
    // Add a new page for each copy after the first one
    if (index > 0) {
      doc.addPage();
    }
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
  const imgData="data:image/png;base64,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"
   doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
    // doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
    doc.setFontSize(8);
    doc.text("Sri Irulappa Swamy Dhunai", 90, 8.5);
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);  
    // Set font to bold and add the text
    doc.setFont('helvetica', 'bold');
    doc.text('NANDHINI FIREWORKS', 44, 18);
       doc.setTextColor(0, 0, 0);
       // Reset font to normal
       doc.setFont('helvetica', 'bold');
       doc.setFontSize(8.5);
       // Add the rest of the text
       doc.text('559, Kankarseval, Sivakasi-626123', 44, 25);
       doc.setFontSize(9);
       doc.setFont('helvetica', 'bold');
       doc.text('Phone number:', 44, 32); // Regular text
      doc.setFont('helvetica', 'normal');
      doc.text('+91 97867 69539', 68, 32); // Bold text
       doc.setFont('helvetica', 'bold');
       doc.text('Email:', 44, 39);
       doc.setFont('helvetica', 'normal');
       doc.text('ekarupasamy1978@gmail.com', 54, 39);
       doc.setFont('helvetica', 'bold');
       doc.text('State:', 44, 45);
       doc.setFont('helvetica', 'normal');
       doc.text('33-Tamil Nadu', 53, 45);
       doc.setFontSize(10);
       doc.setTextColor(255, 0, 0);  
       doc.setFont('helvetica', 'bold');
        doc.text(`TAX INVOICE`, 138, 18);
        doc.text(`${copyType}`,138, 25);
        doc.text(`Invoice Number: NF-${invoiceNumber}-24`, 138, 32);
        doc.setTextColor(0, 0, 0);
   doc.setFont('helvetica', 'normal');
   doc.setFontSize(9);
   const formattedDate = selectedDate.toLocaleDateString(); 
   
   doc.text(`Date: ${formattedDate}`, 138, 39);
   doc.setFont('helvetica', 'bold');
   doc.text('GSTIN: 33CQSPM0068G1ZP', 138, 45);
   
   
   doc.rect(14, 12, 182, 36  );
   
   doc.setFontSize(9);
   doc.setTextColor(170, 51, 106);  
   // Set font to bold and add the text
   doc.setFont('helvetica', 'bold');
   doc.text('TO', 15, 54);
   doc.setTextColor(0, 0, 0);
   
   
   doc.setFont('helvetica', 'normal');
   
   doc.setFontSize(9);
          doc.setTextColor(170, 51, 106);  
   
          
          doc.setTextColor(0, 0, 0);
   
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const startX = 19;
          let startY = 59;
          const lineHeight = 6; 
         
          const labels = [
            'Name',
            'Address',
            'State',
            'Phone',
            'GSTIN',
            'PAN'
          ];
          
          const values = [
            customerName,
            customerAddress,
            customerState,
            customerPhoneNo,
            customerGSTIN,
            customerPan
          ];
   
          const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));
   
          const colonOffset = 2; 
          const maxLineWidth = 160; 
          const maxTextWidth = 104; 
   
          labels.forEach((label, index) => {
            const labelText = label;
            const colonText = ':';
            const valueText = values[index];
          
            // Calculate positions
            const colonX = startX + maxLabelWidth + colonOffset;
            const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;
   
            const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);
   
            doc.text(labelText, startX, startY);
            doc.text(colonText, colonX, startY);
   
            splitValueText.forEach((line, lineIndex) => {
              doc.text(line, valueX, startY + (lineIndex * lineHeight));
            });
   
            startY += lineHeight * splitValueText.length;
          });
             
      doc.setFontSize(9);
      doc.setTextColor(170, 51, 106);  
     
      doc.setFont('helvetica', 'bold');
      doc.text('Account Details', 111, 54);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      const initialX = 114;
      let initialY = 61;
      const lineSpacing = 6;  
      const spacingBetweenLabelAndValue = 3; 
      const maxValueWidth = 65; 
      const labelTexts = [
        'A/c Holder Name',
        'A/c Number',
        'Bank Name',
        'Branch',
        'IFSC Code',
        
      ];
   
      const valuesTexts = [
        'NANDHINI FIREWORKS FACTORY',
        '6736598840',
        'INDIAN BANK',
        'SIVAKASI',
        'IDIB000S733',
        
      ];
   
      const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));
   
      const colonWidth = doc.getTextWidth(':');
   
      labelTexts.forEach((labelText, index) => {
        const valueText = valuesTexts[index];
   
        const labelWidth = doc.getTextWidth(labelText);
        const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);
   
        const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;
   
        const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);
   
        doc.text(labelText, initialX, initialY);
        doc.text(':', colonX, initialY); 
   
        splitValueText.forEach((line, lineIndex) => {
          doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
        });
   
        initialY += lineSpacing * splitValueText.length;
      });
   
      const rectX = 14; // Starting X position of the rectangle
      const rectY = 49; // Starting Y position of the rectangle
      const rectWidth = 182; // Total width of the rectangle
      const rectHeight = 43; // Total height of the rectangle
      
      doc.rect(rectX, rectY, rectWidth, rectHeight);
      
      // To move the line to the right side, add an offset to rectX
      const offsetFromLeft = 95; // Adjust this value as needed to move the line to the right
      const lineX = rectX + offsetFromLeft;
      
      doc.line(lineX, rectY, lineX, rectY + rectHeight); // Draw the vertical line
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Construct tableBody with product details
      const tableBody = cart
        .filter(item => item.quantity > 0)
        .map((item, index) => [
          (index + 1).toString(),
          item.name,
          '36041000',
          item.quantity.toString(),
          `Rs. ${item.saleprice.toFixed(2)}`,
          `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
        ]);
      
      // Calculate fixed number of rows for the table
      const FIXED_TABLE_ROWS = 13; // Set the total rows for consistent height
      const usedRows = tableBody.length; // Rows already occupied by product data
      const emptyRows = FIXED_TABLE_ROWS - usedRows - 6; // 6 rows for totals & tax
      
      // Add placeholder rows if needed
      for (let i = 0; i < emptyRows; i++) {
        tableBody.push(['', '', '', '', '', '']);
      }
      
      // Add rows for total amount, discount, tax, etc.
      tableBody.push(
        [
          { content: 'Total Amount:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${Math.round(billingDetails.totalAmount)}.00`, styles: { fontStyle: 'bold' } }
        ],
        [
          { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fontStyle: 'bold' } }
        ],
        [
          { content: 'Sub Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fontStyle: 'bold' } }
        ]
      );
      
      if (taxOption === 'cgst_sgst') {
        tableBody.push(
          [
            { content: 'CGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fontStyle: 'bold' } }
          ],
          [
            { content: 'SGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fontStyle: 'bold' } }
          ]
        );
      } else if (taxOption === 'igst') {
        tableBody.push(
          [
            { content: 'IGST (18%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `${Math.round(billingDetails.igstAmount)}.00`, styles: { fontStyle: 'bold' } }
          ]
        );
      }
      
      // Add grand total
      tableBody.push(
        [
          { content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${Math.round(billingDetails.grandTotal)}.00`, styles: { fontStyle: 'bold' } }
        ],
        [
          { content: 'Total Quantity:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: totalQuantity.toString(), colSpan: 3, styles: { fontStyle: 'bold' } }
        ]
      );
   doc.autoTable({
     head: [['S.No', 'Product Name', 'HSN Code', 'Quantity', 'Rate Per Price', 'Total']],
     body: tableBody,
     startY: 93,
     theme: 'grid',
     headStyles: {
       fillColor: [255, 182, 193],
       textColor: [0, 0, 139],
       lineWidth: 0.2,
       lineColor: [0, 0, 0],
     },
     bodyStyles: {
       fillColor: [255, 255, 255],
       textColor: [0, 0, 0],
       lineWidth: 0.2,  // Apply line width to all rows for border
       lineColor: [0, 0, 0],  // Set line color for borders
     },
     alternateRowStyles: { fillColor: [245, 245, 245] },
     
     // Use didParseCell hook to selectively apply lineWidth for product rows
     didParseCell: function (data) {
       if (data.row.index < tableBody.length - (6 + emptyRows)) {
         // Apply border for product rows
         data.cell.styles.lineWidth = 0.2; // Ensure border for product rows
       } else {
         // Ensure no underline for empty rows (but borders still visible)
         data.cell.styles.lineWidth = 0.2; // Retain border for all rows
       }
     },
   });
  
   const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
   const pageSizeWidth = doc.internal.pageSize.getWidth();
   const pageSizeHeight = doc.internal.pageSize.getHeight();
   
   const borderMargin = 10;
   const borderWidth = 0.2;
   const additionalTopPadding = 30;
   let currentPage = 1;
   
   // Draw page border
   const drawPageBorder = () => {
     doc.setDrawColor(0, 0, 0); // Border color (black)
     doc.setLineWidth(borderWidth);
     doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
   };
   
   // Check if content will fit on the current page
   const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
     if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
       if (currentPage > 1) { // Only add a new page if not the first page
         doc.addPage();
         drawPageBorder();
         currentPage++; // Increment the page number
       }
       return resetY ? borderMargin + additionalTopPadding : currentY; // Apply margin for new page or keep currentY
     }
     return currentY;
   };
   
   // Initialize the y position after auto table
   let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table
   
   // Grand total in words
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(10);
   const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
   const backgroundColor = [255, 182, 193]; // RGB for light pink
   const textColor = [0, 0, 139]; // RGB for dark blue
   const marginLeft = borderMargin + 7; // Adjusted to be within margins
   const padding = 5;
   const backgroundWidth = 186; // Fixed width for the background rectangle
   const text = `Rupees: ${grandTotalInWords}`;
   const textDimensions = doc.getTextDimensions(text);
   const textWidth = textDimensions.w;
   const textHeight = textDimensions.h;
   
   const backgroundX = marginLeft - padding;
   const backgroundY = y - textHeight - padding;
   const backgroundHeight = textHeight + padding * 2; // Height including padding
   y = checkPageEnd(y, backgroundHeight);
   doc.setTextColor(...textColor);
   doc.text(text, marginLeft, y);
   const rectFX = borderMargin + 4; // Adjusted to be within margins
   const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
   const rectPadding = 4; // Padding inside the rectangle
   const textLineHeight = 8; // Line height for text, renamed here
   const rectFHeight = 6 + textLineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding
   y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);
   doc.setFont('helvetica', 'normal');
   const yOffset = 16; // Adjust this value to move the rectangle and its content downward
   doc.rect(rectFX, y + yOffset, rectFWidth, rectFHeight); 
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(10);
   let textY = y + yOffset + rectPadding + 6; // Apply yOffset here
   doc.text('Terms & Conditions', rectFX + rectPadding, textY);
   textY = checkPageEnd(textY + textLineHeight, textLineHeight, false);
   doc.setFont('helvetica', 'normal');
   doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY); 
   textY = checkPageEnd(textY + textLineHeight, textLineHeight, false);
   doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);
   // Add "Authorised Signature" inside the rectangle at the bottom right corner
   const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
   const authSigY = y + yOffset + rectFHeight - rectPadding; // Apply yOffset here
   doc.setFont('helvetica', 'bold');
   doc.text('Authorised Signature', authSigX, authSigY);
   // Continue with additional content
   y = checkPageEnd(y + yOffset + rectFHeight + 8, 40, false); // Apply yOffset here
   doc.setFontSize(12);
   doc.setTextColor(170, 51, 106);
   y = checkPageEnd(y + 45, 10, false);
   doc.setFontSize(9);
   doc.setTextColor(0, 0, 0);
   y = checkPageEnd(y + 5, 20, false);
   doc.setFont('helvetica', 'bold');
   y = checkPageEnd(y + 7, 23, false);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(10);
   drawPageBorder();
   
  });
alert(`Stock updated and Bill generated!`); 
doc.save(`invoice_${invoiceNumber}_${copyType}.pdf`);
};
const handleGenerateAllCopies = async () => {
  await saveBillingDetails(manualInvoiceNumber);
  transportCopy(manualInvoiceNumber);
 
  // CustomerCopy(manualInvoiceNumber)
};

const transportCopy = (invoiceNumber) => {
  generatePDF('TRANSPORT COPY', invoiceNumber);
};

const salesCopy = (invoiceNumber) => {
  generatePDF('SALES COPY', invoiceNumber);
};

const OfficeCopy = (invoiceNumber) => {
  generatePDF('OFFICE COPY', invoiceNumber);
};
const Customer = (invoiceNumber) => {
  generatePDF('Customer COPY', invoiceNumber);
};
const CustomerCopy = async () => {
  if (cart.length === 0) {
    alert('The cart is empty. Please add items to the cart before saving.');
    return; // Exit the function if the cart is empty
  }

  // Validate the invoice number
  const invoiceNumber = manualInvoiceNumber.trim();
  if (!invoiceNumber) {
    alert('Please enter a valid invoice number.');
    return; // Exit the function if the invoice number is empty
  }
  const billingDocRef = collection(db, 'customerBilling');
  
  try {
    
    await addDoc(billingDocRef, {
      ...billingDetails,
      customerName,
      customerAddress,
      customerState,
      customerPhoneNo,
      customerEmail,
      customerGSTIN,
     
      productsDetails: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        saleprice: item.saleprice,
        quantity: item.quantity
      })),
      createdAt: Timestamp.fromDate(selectedDate),
      invoiceNumber, // Use the same invoice number
    });
    console.log('Billing details saved successfully in Firestore');
  } catch (error) {
    console.error('Error saving billing details: ', error);
  }

  // Generate and save PDF invoice
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
 
const imgData="data:image/png;base64,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"
  doc.addImage(imgData, 'JPEG', 17, 20, 22, 22);
  doc.setFontSize(8);
      doc.text("Sri Irulappa Swamy Dhunai", 90, 8.5);
 doc.setFontSize(10);
 doc.setTextColor(255, 0, 0);  
 // Set font to bold and add the text
 doc.setFont('helvetica', 'bold');
 doc.text('NANDHINI FIREWORKS', 44, 18);
    doc.setTextColor(0, 0, 0);
    // Reset font to normal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    // Add the rest of the text
    doc.text('559, Kankarseval, Sivakasi-626123', 44, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Phone number:', 44, 32); // Regular text
   doc.setFont('helvetica', 'normal');
   doc.text('+91 97867 69539', 68, 32); // Bold text
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 44, 39);
    doc.setFont('helvetica', 'normal');
    doc.text('ekarupasamy1978@gmail.com', 54, 39);
    doc.setFont('helvetica', 'bold');
    doc.text('State:', 44, 45);
    doc.setFont('helvetica', 'normal');
    doc.text('33-Tamil Nadu', 53, 45);
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);  
    doc.setFont('helvetica', 'bold');
     doc.text(`TAX INVOICE`, 138, 18);
     doc.text(`CUSTOMER COPY`,138, 25);
     doc.text(`Invoice Number: NF-${invoiceNumber}-24`, 138, 32);
     doc.setTextColor(0, 0, 0);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
const formattedDate = selectedDate.toLocaleDateString(); 

doc.text(`Date: ${formattedDate}`, 138, 39);
doc.setFont('helvetica', 'bold');
doc.text('GSTIN: 33CQSPM0068G1ZP', 138, 45);


doc.rect(14, 12, 182, 36  );

doc.setFontSize(9);
doc.setTextColor(170, 51, 106);  
// Set font to bold and add the text
doc.setFont('helvetica', 'bold');
doc.text('TO', 15, 54);
doc.setTextColor(0, 0, 0);


doc.setFont('helvetica', 'normal');

doc.setFontSize(9);
       doc.setTextColor(170, 51, 106);  

       
       doc.setTextColor(0, 0, 0);

       doc.setFont('helvetica', 'normal');
       doc.setFontSize(9);
       const startX = 19;
       let startY = 59;
       const lineHeight = 6; 
      
       const labels = [
         'Name',
         'Address',
         'State',
         'Phone',
         'GSTIN',
         'PAN'
       ];
       
       const values = [
         customerName,
         customerAddress,
         customerState,
         customerPhoneNo,
         customerGSTIN,
         customerPan
       ];

       const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

       const colonOffset = 2; 
       const maxLineWidth = 160; 
       const maxTextWidth = 104; 

       labels.forEach((label, index) => {
         const labelText = label;
         const colonText = ':';
         const valueText = values[index];
       
         // Calculate positions
         const colonX = startX + maxLabelWidth + colonOffset;
         const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

         const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);

         doc.text(labelText, startX, startY);
         doc.text(colonText, colonX, startY);

         splitValueText.forEach((line, lineIndex) => {
           doc.text(line, valueX, startY + (lineIndex * lineHeight));
         });

         startY += lineHeight * splitValueText.length;
       });
          
   doc.setFontSize(9);
   doc.setTextColor(170, 51, 106);  
  
   doc.setFont('helvetica', 'bold');
   doc.text('Account Details', 111, 54);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(9);
   const initialX = 114;
   let initialY = 61;
   const lineSpacing = 6;  
   const spacingBetweenLabelAndValue = 3; 
   const maxValueWidth = 65; 
   const labelTexts = [
     'A/c Holder Name',
     'A/c Number',
     'Bank Name',
     'Branch',
     'IFSC Code',
     
   ];

   const valuesTexts = [
     'NANDHINI FIREWORKS FACTORY',
     '6736598840',
     'INDIAN BANK',
     'SIVAKASI',
     'IDIB000S733',
     
   ];

   const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

   const colonWidth = doc.getTextWidth(':');

   labelTexts.forEach((labelText, index) => {
     const valueText = valuesTexts[index];

     const labelWidth = doc.getTextWidth(labelText);
     const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);

     const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;

     const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);

     doc.text(labelText, initialX, initialY);
     doc.text(':', colonX, initialY); 

     splitValueText.forEach((line, lineIndex) => {
       doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
     });

     initialY += lineSpacing * splitValueText.length;
   });

   const rectX = 14; // Starting X position of the rectangle
   const rectY = 49; // Starting Y position of the rectangle
   const rectWidth = 182; // Total width of the rectangle
   const rectHeight = 43; // Total height of the rectangle
   
   doc.rect(rectX, rectY, rectWidth, rectHeight);
   
   // To move the line to the right side, add an offset to rectX
   const offsetFromLeft = 95; // Adjust this value as needed to move the line to the right
   const lineX = rectX + offsetFromLeft;
   
   doc.line(lineX, rectY, lineX, rectY + rectHeight); // Draw the vertical line
   
   
   
   const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

   // Construct tableBody with product details
   const tableBody = cart
     .filter(item => item.quantity > 0)
     .map((item, index) => [
       (index + 1).toString(),
       item.name,
       '36041000',
       item.quantity.toString(),
       `Rs. ${item.saleprice.toFixed(2)}`,
       `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
     ]);
   
   // Calculate fixed number of rows for the table
   const FIXED_TABLE_ROWS = 13; // Set the total rows for consistent height
   const usedRows = tableBody.length; // Rows already occupied by product data
   const emptyRows = FIXED_TABLE_ROWS - usedRows - 6; // 6 rows for totals & tax
   
   // Add placeholder rows if needed
   for (let i = 0; i < emptyRows; i++) {
     tableBody.push(['', '', '', '', '', '']);
   }
   
   // Add rows for total amount, discount, tax, etc.
   tableBody.push(
     [
       { content: 'Total Amount:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: `${Math.round(billingDetails.totalAmount)}.00`, styles: { fontStyle: 'bold' } }
     ],
     [
       { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fontStyle: 'bold' } }
     ],
     [
       { content: 'Sub Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fontStyle: 'bold' } }
     ]
   );
   
   if (taxOption === 'cgst_sgst') {
     tableBody.push(
       [
         { content: 'CGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
         { content: `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fontStyle: 'bold' } }
       ],
       [
         { content: 'SGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
         { content: `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fontStyle: 'bold' } }
       ]
     );
   } else if (taxOption === 'igst') {
     tableBody.push(
       [
         { content: 'IGST (18%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
         { content: `${Math.round(billingDetails.igstAmount)}.00`, styles: { fontStyle: 'bold' } }
       ]
     );
   }
   
   // Add grand total
   tableBody.push(
     [
       { content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: `${Math.round(billingDetails.grandTotal)}.00`, styles: { fontStyle: 'bold' } }
     ],
     [
       { content: 'Total Quantity:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: totalQuantity.toString(), colSpan: 3, styles: { fontStyle: 'bold' } }
     ]
   );
   
   // Generate the table with jsPDF autoTable
   // Generate the table with jsPDF autoTable
// Generate the table with jsPDF autoTable
doc.autoTable({
  head: [['S.No', 'Product Name', 'HSN Code', 'Quantity', 'Rate Per Price', 'Total']],
  body: tableBody,
  startY: 93,
  theme: 'grid',
  headStyles: {
    fillColor: [255, 182, 193],
    textColor: [0, 0, 139],
    lineWidth: 0.2,
    lineColor: [0, 0, 0],
  },
  bodyStyles: {
    fillColor: [255, 255, 255],
    textColor: [0, 0, 0],
    lineWidth: 0.2,  // Apply line width to all rows for border
    lineColor: [0, 0, 0],  // Set line color for borders
  },
  alternateRowStyles: { fillColor: [245, 245, 245] },
  
  // Use didParseCell hook to selectively apply lineWidth for product rows
  didParseCell: function (data) {
    if (data.row.index < tableBody.length - (6 + emptyRows)) {
      // Apply border for product rows
      data.cell.styles.lineWidth = 0.2; // Ensure border for product rows
    } else {
      // Ensure no underline for empty rows (but borders still visible)
      data.cell.styles.lineWidth = 0.2; // Retain border for all rows
    }
  },
});

   
       
  
       const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
const pageSizeWidth = doc.internal.pageSize.getWidth();
const pageSizeHeight = doc.internal.pageSize.getHeight();

const borderMargin = 10;
const borderWidth = 0.2;
const additionalTopPadding = 30;
let currentPage = 1;

// Draw page border
const drawPageBorder = () => {
  doc.setDrawColor(0, 0, 0); // Border color (black)
  doc.setLineWidth(borderWidth);
  doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
};

// Check if content will fit on the current page
const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
  if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
    if (currentPage > 1) { // Only add a new page if not the first page
      doc.addPage();
      drawPageBorder();
      currentPage++; // Increment the page number
    }
    return resetY ? borderMargin + additionalTopPadding : currentY; // Apply margin for new page or keep currentY
  }
  return currentY;
};

// Initialize the y position after auto table
let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table

// Grand total in words
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
const backgroundColor = [255, 182, 193]; // RGB for light pink
const textColor = [0, 0, 139]; // RGB for dark blue
const marginLeft = borderMargin + 7; // Adjusted to be within margins
const padding = 5;
const backgroundWidth = 186; // Fixed width for the background rectangle
const text = `Rupees: ${grandTotalInWords}`;
const textDimensions = doc.getTextDimensions(text);
const textWidth = textDimensions.w;
const textHeight = textDimensions.h;

const backgroundX = marginLeft - padding;
const backgroundY = y - textHeight - padding;
const backgroundHeight = textHeight + padding * 2; // Height including padding

// Check if there’s enough space for the content; if not, create a new page
y = checkPageEnd(y, backgroundHeight);

// Add text on top of the background
doc.setTextColor(...textColor);
doc.text(text, marginLeft, y);

// Continue with "Terms & Conditions" and other content
const rectFX = borderMargin + 4; // Adjusted to be within margins
const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
const rectPadding = 4; // Padding inside the rectangle
const textLineHeight = 8; // Line height for text, renamed here
const rectFHeight = 6 + textLineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding

// Ensure there's enough space for the rectangle and text
y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);

doc.setFont('helvetica', 'normal');
// doc.rect(rectFX, y, rectFWidth, rectFHeight);

// Drawing the "Terms & Conditions" text inside the rectangle
const yOffset = 16; // Adjust this value to move the rectangle and its content downward

// Draw the rectangle with adjusted y value
doc.rect(rectFX, y + yOffset, rectFWidth, rectFHeight); // Apply yOffset to the y position

doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

// Adjusted y position for the rectangle content
let textY = y + yOffset + rectPadding + 6; // Apply yOffset here
doc.text('Terms & Conditions', rectFX + rectPadding, textY);

// Adjust vertical position for the following text
textY = checkPageEnd(textY + textLineHeight, textLineHeight, false);
doc.setFont('helvetica', 'normal');
doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY);

textY = checkPageEnd(textY + textLineHeight, textLineHeight, false);
doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);

// Add "Authorised Signature" inside the rectangle at the bottom right corner
const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
const authSigY = y + yOffset + rectFHeight - rectPadding; // Apply yOffset here
doc.setFont('helvetica', 'bold');
doc.text('Authorised Signature', authSigX, authSigY);

// Continue with additional content
y = checkPageEnd(y + yOffset + rectFHeight + 8, 40, false); // Apply yOffset here

// Reset font and color for additional text
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);

// More content with additional checks
y = checkPageEnd(y + 45, 10, false);
doc.setFontSize(9);
doc.setTextColor(0, 0, 0);

y = checkPageEnd(y + 5, 20, false);
doc.setFont('helvetica', 'bold');

y = checkPageEnd(y + 7, 23, false);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

// Draw the page border at the end
drawPageBorder();


doc.save(`invoice_${invoiceNumber}_CUSTOMERCOPY.pdf`);

};



const handleSearch = (event) => {
const term = event.target.value.toLowerCase();
setSearchTerm(term);

setFilteredProducts(
products.filter(product => {
const productName = product.name ? product.name.toLowerCase() : '';
const productCode = product.sno !== undefined && product.sno !== null
  ? product.sno.toString().toLowerCase()
  : '';
return productName.includes(term) || productCode.includes(term);
})
);
};
 

  const addToCart = (product) => {
    if (!product.inStock) {
      alert("This product is out of stock.");
      return;
    }

    const newItem = {
      productId: product.id,
      name: product.name,
      saleprice: product.saleprice,
      quantity: 1
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    // Find the index of the first item with the matching productId
    const itemIndex = cart.findIndex(item => item.productId === productId);
  
    if (itemIndex !== -1) {
      // Create a new cart array without the item at itemIndex
      const updatedCart = [...cart];
      updatedCart.splice(itemIndex, 1); // Remove one item at the found index
  
      setCart(updatedCart);
      updateBillingDetails(updatedCart);
    }
  };
  

  const handleDateChange = (event) => {
    const newSelectedDate = new Date(event.target.value);
    console.log('Selected Date:', newSelectedDate);
    setSelectedDate(newSelectedDate);
  };
  const handlePriceChange = (productId, saleprice) => {
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, saleprice: parseFloat(saleprice) || 0 }
        : item
    );
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };
  
 

return (
  <div className="billing-calculator">
    {/* Product Search and Filter */}
    
    <div className="product-list">
    <input
  type="text"
  placeholder="Search Products"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="search-input"
/>

     

     
  <ul>
  {filteredProducts
    .sort((a, b) => {
      // Sort sno as strings
      return a.sno.localeCompare(b.sno, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(product => (
      <li key={product.id}>
        <div className="product-details">
          <span>{product.name}</span>
          {/* <span>{`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span> */}
          <span>{`(InStock Rs. ${product.quantity ? product.quantity : '0'})`}</span>
        </div>
        <button onClick={() => addToCart(product)}>+</button>
      </li>
    ))}
</ul>

    </div>

    {/* Cart Section */}
    <div className="cart">
  <h2>Cart</h2>
  <button
    className="remove-button"
    style={{ display: "flex", position: "relative", left: "530px", bottom: "34px" }}
    onClick={() => ClearAllData()}
  >
    Clear cart
  </button>
  <ul>
    {cart.map((item) => (
      <li key={item.productId}>
        <div className="cart-item">
          <span>{item.name}</span>
          <input
  type="number"
  placeholder="Enter Quantity"
  value={item.quantity || ""}
  onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
   style={{
    width: '80px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box', // ensures padding is included in width
  }}
/>

<input
  type="number"
  placeholder="Enter Price"
  value={item.saleprice || ""}
  onChange={(e) => handlePriceChange(item.productId, e.target.value)}
  style={{
    width: '80px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box', // ensures padding is included in width
  }}
/>

          <span style={{padding:"10px"}}>
            Rs.{" "}
            {(item.saleprice && item.quantity
              ? item.saleprice * item.quantity
              : 0
            ).toFixed(2)}
          </span>
          <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>
            Remove
          </button>
        </div>
      </li>
    ))}
  </ul>

      {/* Billing Summary */}
      <div className="billing-summary">
        <div className="billing-details">
          <label>Invoice Number</label>
          <input
            type="text"
            placeholder="Enter Invoice Number"
            value={manualInvoiceNumber}
            onChange={(e) => setManualInvoiceNumber(e.target.value)}
            required
          />
          <label>Discount (%)</label>
          <input
          
            type="number"
            value={billingDetails.discountPercentage}
            onChange={handleDiscountChange}
            min="0"
            max="100"
          />

          <label>Date</label>
          <input
            type="date"
            className="custom-datepicker"
            value={selectedDate.toISOString().substr(0, 10)}
            onChange={handleDateChange}
          />
          <br />
          <br />
          <label>Tax Option</label>
          <select
            value={taxOption}
            onChange={(e) => setTaxOption(e.target.value)}
          >
            <option value="cgst_sgst">CGST + SGST</option>
            <option value="igst">IGST</option>
            <option value="no_tax">No Tax</option>
          </select>
        </div>

        <div className="billing-amounts">
          <table>
            <tbody>
              <tr>
                <td>Total Amount:</td>
                <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discounted Total:</td>
                <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
              </tr>
              {taxOption === "cgst_sgst" && (
                <>
                  <tr>
                    <td>CGST (9%):</td>
                    <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              {taxOption === "igst" && (
                <tr>
                  <td>IGST (18%):</td>
                  <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="grand-total-row">
                <td>Grand Total:</td>
                <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="customer-search">
  <input
        type="text"
        placeholder="Search Customers"
        value={searchTermForCustomers}
        onChange={(e) => setSearchTermForCustomers(e.target.value)}
        className="search-input"
      />
      {searchTermForCustomers && (
        <div className="dropdown">
          {filteredCustomers.length === 0 ? (
            <div className="dropdown-item">No customers found</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="dropdown-item"
                onClick={() => handleCustomerClick(customer)} // Handle click as needed
              >
                <div className="customer-details">
                  <span>{customer.customerName}</span>
                  <span>{customer.customerPhone}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}



    </div>


      {/* Customer Details Section */}
      <div className="customer-details-toggle">
  {/* <button className="toggle-button" onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
    {showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
  </button> */}
</div>

{showCustomerDetails && (
 <div className="customer-details">
 <label>Customer Name</label>
 <input
   type="text"
   value={customerName}
   onChange={(e) => setCustomerName(e.target.value)}
 />
 <label>Customer Address</label>
 <input
   type="text"
   value={customerAddress}
   onChange={(e) => setCustomerAddress(e.target.value)}
 />
 <label>Customer State</label>
 <input
   type="text"
   value={customerState}
   onChange={(e) => setCustomerState(e.target.value)}
 />
 <label>Customer Phone</label>
 <input
   type="text"
   value={customerPhoneNo}
   onChange={(e) => setCustomerPhone(e.target.value)}
 />
 <label>Customer GSTIN</label>
 <input
   type="text"
   value={customerGSTIN}
   onChange={(e) => setCustomerGSTIN(e.target.value)}
 />
 <label>Customer PAN</label>
 <input
   type="text"
   value={customerPan}
   onChange={(e) => setCustomerPAN(e.target.value)}
 />
 <label>Customer Email</label>
 <input
   type="email"
   value={customerEmail}
   onChange={(e) => setCustomerEmail(e.target.value)}
 />
</div>

)}


{/* Action Buttons */}
<div className="button-container d-flex flex-wrap gap-2">
<button 
    className="btn btn-outline-secondary" 
    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
  >
    {showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
  </button>
  <button 
    className="btn btn-primary" 
    onClick={() => addToCart({ id: 1, name: "Assorted Crackers", saleprice: null })}
  >
    Assorted Crackers
  </button>
  <button className="btn btn-success" onClick={handleGenerateAllCopies}>
    Download All Copies
  </button>
  <button 
    className="btn btn-info" 
    style={{ display: "none" }} 
    onClick={() => transportCopy(invoiceNumber)}
  >
    Transport Copy
  </button>
  <button 
    className="btn btn-warning" 
    style={{ display: "none" }} 
    onClick={() => salesCopy(invoiceNumber)}
  >
    Sales Copy
  </button>
  <button 
    className="btn btn-danger" 
    style={{ display: "none" }} 
    onClick={() => OfficeCopy(invoiceNumber)}
  >
    Office Copy
  </button>
  <button className="btn btn-dark" onClick={() => CustomerCopy(invoiceNumber)}>
    Customer Copy
  </button>

</div>


    </div>
  </div>
);
};
export default BillingCalculator;

