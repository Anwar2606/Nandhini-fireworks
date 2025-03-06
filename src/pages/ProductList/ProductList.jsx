import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Assuming you have this configured
import { collection, query, where, getDocs, doc, deleteDoc, orderBy } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./ProductList.css";
import {
  FaHome,
  FaEye,
  FaEdit,
  FaFileInvoice,
  FaArrowCircleLeft,
  FaArrowAltCircleRight,
  FaTruck,
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { TbListNumbers } from "react-icons/tb";
import Logo from "../assets/nandhini-logo.png";
import { IoIosPerson } from "react-icons/io";
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [category, setCategory] = useState('');
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollectionRef = collection(db, "products");

      let q = productsCollectionRef;
      if (category) {
        q = query(productsCollectionRef, where("category", "==", category));
      } else {
        q = query(productsCollectionRef);
      }

      try {
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort products numerically and alphabetically
        fetchedProducts.sort((a, b) => {
          const nameA = a.name.toUpperCase(); // Convert to uppercase to ensure case-insensitive comparison
          const nameB = b.name.toUpperCase();

          // Compare numerically and alphabetically
          const numberComparison = nameA.localeCompare(nameB, undefined, { numeric: true });
          return numberComparison;
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    const fetchCategoryCounts = async () => {
      const productsCollectionRef = collection(db, "products");
      const querySnapshot = await getDocs(productsCollectionRef);

      const counts = {};
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        if (counts[product.category]) {
          counts[product.category] += 1;
        } else {
          counts[product.category] = 1;
        }
      });

      setCategoryCounts(counts);
    };

    fetchProducts();
    fetchCategoryCounts();
  }, [category]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const toggleDescription = (productId) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          expanded: !product.expanded,
        };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handleBulkUploadClick = () => {
    navigate('/bulkupload');
  };

  const handleNewProductClick = () => {
    navigate('/add');
  };

  // Filter products by search term and category
  const filteredProducts = products.filter(product => 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sno.toString().includes(searchTerm)) &&
    (category ? product.category === category : true)
  );

  const deleteProduct = async (productId, event) => {
    event.stopPropagation();

    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  const handleSelectProduct = (event, productId) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedProducts((prevSelected) => [...prevSelected, productId]);
    } else {
      setSelectedProducts((prevSelected) => prevSelected.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
    setSelectAll(!selectAll);
  };

  const bulkDeleteProducts = async () => {
    const promises = selectedProducts.map(async (productId) => {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    });

    await Promise.all(promises);
    setProducts((prevProducts) =>
      prevProducts.filter((product) => !selectedProducts.includes(product.id))
    );
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const padSno = (sno) => {
    return sno.replace(/(\d+)/, (match) => match.padStart(3, '0'));
  };


const downloadPDF = () => {
  const doc = new jsPDF();

 
  const sortedProducts = [...products].sort((a, b) => {
    const aSno = a.sno ? a.sno.toString() : '';
    const bSno = b.sno ? b.sno.toString() : '';
    return aSno.localeCompare(bSno);
  });

  const groupedProducts = sortedProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  let startY = 50; // Start Y position after the contact information

  Object.keys(groupedProducts).forEach((category) => {
    // Add category title
    doc.setFontSize(16);
    doc.text(category, 14, startY);
    startY += 10;

    // Create table for the category
    const tableColumn = ["S.No", "Name", "Sales Price", "Category"];
    const tableRows = [];

    groupedProducts[category].forEach((product) => {
      const productData = [
        product.sno ? product.sno.toString() : '', // Ensure sno is a string
        product.name,
       
        `Rs. ${product.saleprice.toFixed(2)}`,
        product.category
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: 'striped',
      margin: { top: 10 },
      didDrawPage: function (data) {
        startY = data.cursor.y + 10;
      }
    });

    // Adjust startY for the next category
    startY = doc.previousAutoTable.finalY + 10;
  });

  doc.save("Product_List.pdf");
};
const toggleSidebar = () => {
  setIsOpen(!isOpen);
};

return (
  <div className="main-container">
    {/* Sidebar */}
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <ul>
        <li
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "20px 0",
            borderBottom: "2px solid #c3b6d0",
            paddingBottom: "10px",
          }}
        >
          {isOpen ? (
            "Nandhini Fireworks"
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "-14px",
              }}
            >
              <img
                src={Logo} // Replace with your logo path
                alt="Nandhini Fireworks Logo"
                style={{
                  width: "50px",
                  height: "auto",
                }}
              />
            </div>
          )}
        </li>
        <li>
          <Link to="/newhome">
            <FaHome /> {isOpen && <span>Home</span>}
          </Link>
        </li>
        <li>
          <Link to="/products">
            <AiFillProduct /> {isOpen && <span>Products</span>}
          </Link>
        </li>
        <li>
          <Link to="/allbills">
            <FaEye /> {isOpen && <span>All Bills</span>}
          </Link>
        </li>
        <li>
          <Link to="/editbill">
            <FaEdit /> {isOpen && <span>Edit Bills</span>}
          </Link>
        </li>
        <li>
          <Link to="/bill">
            <FaFileInvoice /> {isOpen && <span>Invoice</span>}
          </Link>
        </li>
        <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li>
         <li><Link to="/showtransport"><FaTruck /> {isOpen && <span>Transport Details</span>}</Link></li>
        <li>
          <Link to="/invoice">
            <TbListNumbers />
            {isOpen && <span>Invoice Numbers</span>}
          </Link>
        </li>
        <li>
          <Link to="/">
            <MdLogout /> {isOpen && <span>Logout</span>}
          </Link>
        </li>
        <li className="menu-item">
          <button
            onClick={toggleSidebar}
            style={{
              padding: "10px",
              backgroundColor: "#1b2594",
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              cursor: "pointer",
            }}
          >
            {isOpen ? (
              <FaArrowCircleLeft style={{ color: "white" }} />
            ) : (
              <FaArrowAltCircleRight style={{ color: "white" }} />
            )}
          </button>
        </li>
      </ul>
    </div>

    {/* Main Content */}
    <div className="content-container">
      <div className="product-list-container">
        <h2 className="product-list-title">Product List</h2>
        <input
          type="text"
          className="product-list-input"
          placeholder="Search products"
          value={searchTerm}
          onChange={handleSearch}
        />
        <select
          className="custom-select"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">All Products</option>
          {Object.keys(categoryCounts).map((cat) => (
            <option key={cat} value={cat}>
              {cat} ({categoryCounts[cat]})
            </option>
          ))}
        </select>
        <div className="button-row">
  <button className="select-all-button" onClick={handleSelectAll}>
    {selectAll ? "Deselect All" : "Select All"}
  </button>
  <button className="bulk-delete-button" onClick={bulkDeleteProducts}>
    <i className="fas fa-trash-alt"></i> Bulk Delete
  </button>
  <button className="bulk-new-button" onClick={handleNewProductClick}>
    <i className="fa fa-plus-circle"></i> New
  </button>
  <button className="bulk-upload-button" onClick={handleBulkUploadClick}>
    <i className="fa fa-upload"></i> Bulk Upload
  </button>
  <button className="download-button2" onClick={downloadPDF}>
    <i className="fa fa-download"></i> Download PDF
  </button>
</div>

        <ul className="product-list">
          {filteredProducts.map((product) => (
            <li key={product.id} className="product-item">
              <input
                type="checkbox"
                className="product-checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(event) => handleSelectProduct(event, product.id)}
              />
              <div
                className="product-info"
                onClick={() => toggleDescription(product.id)}
              >
                <div className="products-details">
                  <div className="product-name">{product.name}</div>
                  {product.expanded && (
                    <div className="product-description">
                      {product.description}
                    </div>
                  )}
                  <div className="product-price">
                    Sales price: Rs.{product.saleprice.toFixed(2)}
                  </div>
                  <div className="product-price">
                    InStock: {product.quantity}
                  </div>
                </div>
              </div>
              <div className="product-actions">
                <Link to={`/edit-product/${product.id}`}>
                  <button className="edit-button">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                </Link>
                <button
                  className="delete-button"
                  onClick={(event) => deleteProduct(product.id, event)}
                >
                  <i className="fas fa-trash-alt"></i> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
};

export default ProductList;
