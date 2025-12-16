import React, { useState } from "react";


import Admin from "./components/Admin";
import Producer from "./components/Producer";
import Transporter from "./components/Transporter";
import Distributor from "./components/Distributor";
import Retailer from "./components/Retailer";
import Customer from "./components/Customer";

function App() {
  
  const [activeRole, setActiveRole] = useState(null);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🥦 FRESHCHAIN TRACKING SYSTEM</h1>
        <p style={styles.subtitle}>Blockchain Based Food Supply Chain</p>
      </header>

      {/* --- MAIN MENU (Role Selection) --- */}
      {!activeRole && (
        <div style={styles.menuContainer}>
          <h3 style={{ marginBottom: "50px", color: "#424242", fontWeight: "600" }}>Please Select the Role to Log In As:</h3>
          
          <div style={styles.grid}>
            {/* Admin Button (Red) */}
            <button 
              onClick={() => setActiveRole("admin")} 
              style={{ ...styles.menuButton, backgroundColor: "#fff3f3", color: "#c62828", border: "3px solid #ffcdd2" }}
            >
              🛠️ Admin (Manager)
            </button>

            {/* Producer Button (Green) */}
            <button 
              onClick={() => setActiveRole("producer")} 
              style={{ ...styles.menuButton, backgroundColor: "#f1f8e9", color: "#388e3c", border: "3px solid #c8e6c9" }}
            >
              👨‍🌾 Producer (Farmer)
            </button>

            {/* Transporter Button (Orange) */}
            <button 
              onClick={() => setActiveRole("transporter")} 
              style={{ ...styles.menuButton, backgroundColor: "#fff8e1", color: "#f57c00", border: "3px solid #ffe0b2" }}
            >
              🚚 Transporter
            </button>

            {/* Distributor Button (Purple) */}
            <button 
              onClick={() => setActiveRole("distributor")} 
              style={{ ...styles.menuButton, backgroundColor: "#f3e5f5", color: "#8e24aa", border: "3px solid #e1bee7" }}
            >
              🏭 Distributor
            </button>

            {/* Retailer Button (Pink) */}
            <button 
              onClick={() => setActiveRole("retailer")} 
              style={{ ...styles.menuButton, backgroundColor: "#fce4ec", color: "#d81b60", border: "3px solid #f8bbd0" }}
            >
              🏪 Retailer (Store)
            </button>

            {/* Customer Button (Blue) */}
            <button 
              onClick={() => setActiveRole("customer")} 
              style={{ ...styles.menuButton, backgroundColor: "#e3f2fd", color: "#1976d2", border: "3px solid #bbdefb" }}
            >
              🛒 Customer
            </button>
          </div>
        </div>
      )}

      {/* --- SELECTED PAGE RENDERING --- */}
      {activeRole && (
        <div style={styles.contentContainer}>
          {/* Back Button */}
          <div style={styles.navBar}>
            <button onClick={() => setActiveRole(null)} style={styles.backButton}>
              ⬅ Back to Main Menu
            </button>
            <span style={styles.roleTag}>Current Mode: {activeRole.toUpperCase()}</span>
          </div>

          {/* Rendering the Corresponding Component */}
          <div style={styles.componentWrapper}>
            {activeRole === "admin" && <Admin />}
            {activeRole === "producer" && <Producer />}
            {activeRole === "transporter" && <Transporter />}
            {activeRole === "distributor" && <Distributor />}
            {activeRole === "retailer" && <Retailer />}
            {activeRole === "customer" && <Customer />}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
    container: {
        fontFamily: "'Inter', sans-serif", 
        maxWidth: "960px", 
        margin: "20px auto",
        padding: "30px",
        textAlign: "center",
        backgroundColor: "#f7f7f7", 
        minHeight: "calc(100vh - 40px)",
        borderRadius: "15px", 
    },
    header: {
        marginBottom: "50px",
        borderBottom: "7px solid #e0e0e0", 
        paddingBottom: "35px"
    },
    title: {
        color: "#1a1a1a",
        margin: "0",
        fontSize: "2.5em"
    },
    subtitle: {
        color: "#666",
        marginTop: "10px",
        fontSize: "1.3em"
    },
    menuContainer: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)" 
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "25px",
        marginTop: "30px"
    },
    menuButton: {
        padding: "25px 20px",
        fontSize: "18px",
        fontWeight: "600",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        outline: "none",
        boxShadow: "0 4px 6px rgba(0,0,0,0.08)", 
        border: "none", 
    },
    contentContainer: {
      
    },
    navBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        padding: "10px 0"
    },
    backButton: {
        padding: "10px 25px",
        backgroundColor: "#455a63ff", 
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "20px",
        transition: "background-color 0.3s"
    },
    roleTag: {
        fontSize: "20px",
        color: "#757575",
        fontWeight: "500",
        letterSpacing: "1px",
        padding: "5px 10px",
        backgroundColor: "#e0e0e0",
        borderRadius: "5px"
    },
    componentWrapper: {
        marginTop: "10px"
    }
};

export default App;