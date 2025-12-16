import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Retailer = () => {
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState("");

  // Helper function to connect to the contract using the current wallet signer
  const connectWallet = async () => {
    // Check if MetaMask is available
    if (!window.ethereum) throw new Error("MetaMask is required!");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const handleRegister = async () => {
    try {
        setStatus("⏳ Registering...");
        const contract = await connectWallet();
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        
        // Call the registerRetailer function from the contract
        await (await contract.registerRetailer(signer.getAddress())).wait();
        setStatus("✅ Retailer Registration Successful!");
    } catch(e) { 
        // Simplified error message for display
        setStatus(`❌ Error: ${e.message.includes("RETAILER_ALREADY_REGISTERED") ? "Already registered or not Admin." : e.message}`); 
    }
  };

  const handleInspection = async (e) => {
    e.preventDefault();
    try {
        setStatus("⏳ Approving and confirming arrival...");
        const contract = await connectWallet();
        
        // The contract function is 'markAsArrived' which takes batchId and a boolean (passedInspection)
        // We assume the inspection passes (true)
        // Note: Check if your contract uses markAsArrived or a different naming convention for receiving products
        await (await contract.markAsArrived(batchId, true)).wait(); 
        setStatus("✅ Product Approved and Placed on Shelf!");
    } catch(e) { 
        // Simplified error message for display
        setStatus(`❌ Error: ${e.message.includes("ONLY_RETAILER") ? "Only the Retailer can perform this action." : e.message}`); 
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: "#c2185b"}}>🏪 Retailer Panel</h2>
      <button onClick={handleRegister} style={styles.authBtn}>🔑 Register</button>

      <form onSubmit={handleInspection} style={styles.form}>
        <h3>Receive & Approve Shipment</h3>
        <input 
          type="number" 
          placeholder="Batch ID" 
          value={batchId} 
          onChange={e=>setBatchId(e.target.value)} 
          required 
          style={styles.input}
        />
        <button type="submit" style={styles.button}>✅ APPROVE AND RECEIVE</button>
      </form>
      {status && <div style={styles.statusBox}>{status}</div>}
    </div>
  );
};

const styles = {
    container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#fce4ec" },
    form: { display: "flex", flexDirection: "column", gap: "15px", marginTop:"20px" },
    input: { padding: "10px", border: "1px solid #bbb", borderRadius: "5px" },
    button: { padding: "10px", backgroundColor: "#c2185b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    authBtn: { width:"100%", padding:"8px", cursor:"pointer"},
    statusBox: { marginTop: "10px", padding: "10px", backgroundColor: "#fff" }
};

export default Retailer;