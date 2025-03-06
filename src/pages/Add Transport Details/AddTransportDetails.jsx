import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { IoIosPerson } from "react-icons/io";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/logo.png";
import './AddTransportDetails.css';
const AddTransportDetails = () => {
  const [transportData, setTransportData] = useState({
    transportName: "",
    transportGstin: "",
  });
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (e) => {
    setTransportData({ ...transportData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "transportDetails"), {
        ...transportData,
        timestamp: Timestamp.now(),
      });
      alert("Transport details added successfully!");
      setTransportData({
        transportName: "",
        transportGstin: "",
      });
    } catch (error) {
      console.error("Error adding transport details:", error);
      alert("Failed to add transport details.");
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="main-container flex">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <ul>
          <li style={{ fontSize: "22px", fontWeight: "bold", textAlign: "center", margin: "20px 0", borderBottom: "2px solid #c3b6d0", paddingBottom: "10px" }}>
            {isOpen ? (
              "Nandhini Fireworks"
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "-14px" }}>
                <img src={Logo} alt="Nandhini Fireworks Logo" style={{ width: "50px", height: "auto" }} />
              </div>
            )}
          </li>
          <li><Link to="/newhome"><FaHome /> {isOpen && <span>Home</span>}</Link></li>
          <li><Link to="/products"><AiFillProduct /> {isOpen && <span>Products</span>}</Link></li>
          <li><Link to="/allbills"><FaEye /> {isOpen && <span>All Bills</span>}</Link></li>
          <li><Link to="/editbill"><FaEdit /> {isOpen && <span>Edit Bills</span>}</Link></li>
          <li><Link to="/bill"><FaFileInvoice /> {isOpen && <span>Invoice</span>}</Link></li>
          <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li>
          <li><Link to="/invoice"><TbListNumbers /> {isOpen && <span>Invoice Numbers</span>}</Link></li>
          <li><Link to="/"><MdLogout /> {isOpen && <span>Logout</span>}</Link></li>
          <li className="menu-item">
            <button onClick={toggleSidebar} style={{ padding: "10px", backgroundColor: "#1b2594", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", cursor: "pointer" }}>
              {isOpen ? <FaArrowCircleLeft style={{ color: "white" }} /> : <FaArrowAltCircleRight style={{ color: "white" }} />}
            </button>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="content">
      <div className="container">
        <h2 className="heading">Add Transport Details</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="transportName"
            placeholder="Transport Name"
            value={transportData.transportName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="transportGstin"
            placeholder="Transport GSTIN"
            value={transportData.transportGstin}
            onChange={handleChange}
            className="input"
            required
          />
          <button type="submit" className="button">
            Add Transport Details
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddTransportDetails;
