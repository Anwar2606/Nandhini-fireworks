import React, { useState } from "react";
import { db } from "../../pages/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/nandhini-logo.png"; // Adjust the path as per your project
import { IoIosPerson } from "react-icons/io";

const AddCustomer = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    customerAddress: "",
    customerState: "",
    customerPhoneNo: "",
    customerGSTIN: "",
    customerPan: "",
    customerEmail: "",
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "customer"), customerDetails);
      alert("Customer added successfully!");
      setCustomerDetails({
        customerName: "",
        customerAddress: "",
        customerState: "",
        customerPhoneNo: "",
        customerGSTIN: "",
        customerPan: "",
        customerEmail: "",
      });
    } catch (error) {
      console.error("Error adding customer: ", error);
      alert("Failed to add customer!");
    }
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
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "-14px" }}>
                <img
                  src={Logo}
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
              {isOpen ? <FaArrowCircleLeft style={{ color: "white" }} /> : <FaArrowAltCircleRight style={{ color: "white" }} />}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content" style={{position:"relative",bottom:"105px"}}>
        <div className="Edit-page">
          <h2 className="Page-title">Add Customer</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                name="customerName"
                value={customerDetails.customerName}
                onChange={handleChange}
                className="Edit-input1"
                required
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                name="customerAddress"
                value={customerDetails.customerAddress}
                onChange={handleChange}
                className="Edit-input1"
                required
              />
            </label>
            <label>
              State:
              <input
                type="text"
                name="customerState"
                value={customerDetails.customerState}
                onChange={handleChange}
                className="Edit-input1"
                required
              />
            </label>
            <label>
              Phone No:
              <input
                type="text"
                name="customerPhoneNo"
                value={customerDetails.customerPhoneNo}
                onChange={handleChange}
                className="Edit-input1"
                required
              />
            </label>
            <label>
              GSTIN:
              <input
                type="text"
                name="customerGSTIN"
                value={customerDetails.customerGSTIN}
                onChange={handleChange}
                className="Edit-input2"
              />
            </label>
            <label>
              PAN:
              <input
                type="text"
                name="customerPan"
                value={customerDetails.customerPan}
                onChange={handleChange}
                className="Edit-input2"
              />
            </label>
            <label>
              Email:
              <input
                type="text"
                name="customerEmail"
                value={customerDetails.customerEmail}
                onChange={handleChange}
                className="Edit-input2"
              />
            </label>
            <div>
              <button type="submit" className="Edit-btn">
                Add Customer
              </button>
              <button
                type="button"
                className="Edit-btn"
                onClick={() => {
                  setCustomerDetails({
                    customerName: "",
                    customerAddress: "",
                    customerState: "",
                    customerPhoneNo: "",
                    customerGSTIN: "",
                    customerPan: "",
                    customerEmail: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
