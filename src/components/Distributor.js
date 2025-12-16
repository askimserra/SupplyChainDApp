import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Distributor = () => {
  const [batchId, setBatchId] = useState("");
  const [retailerAddress, setRetailerAddress] = useState("");
  const [status, setStatus] = useState("");

 
  const connectWallet = async () => {
    
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
      
      
      await (await contract.registerDistributor(signer.getAddress())).wait();
      setStatus("✅ Distributor Registration Successful!");
    } catch(e) { 
      
      setStatus(`❌ Error: ${e.message.includes("DISTRIBUTOR_ALREADY_REGISTERED") ? "Already registered or not Admin." : e.message}`); 
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setStatus("⏳ Transferring to retailer...");
      const contract = await connectWallet();
      
      
      await (await contract.transferOwnership(batchId, retailerAddress)).wait();
      setStatus("✅ Transferred to Retailer!");
    } catch(e) { 
      
      setStatus(`❌ Error: ${e.message.includes("ONLY_DISTRIBUTOR") ? "Only the Distributor can perform this action." : e.message}`); 
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: "#7b1fa2"}}>🏭 Distributor Panel</h2>
      <button onClick={handleRegister} style={styles.authBtn}>🔑 Register</button>

      <form onSubmit={handleTransfer} style={styles.form}>
        <h3>Send to Retailer</h3>
        <input 
          type="number" 
          placeholder="Batch ID" 
          value={batchId} 
          onChange={e=>setBatchId(e.target.value)} 
          required 
          style={styles.input}
        />
        <input 
          type="text" 
          placeholder="Retailer Address" 
          value={retailerAddress} 
          onChange={e=>setRetailerAddress(e.target.value)} 
          required 
          style={styles.input}
        />
        <button type="submit" style={styles.button}>TRANSFER TO RETAILER</button>
      </form>
      {status && <div style={styles.statusBox}>{status}</div>}
    </div>
  );
};

const styles = {
    container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f3e5f5" },
    form: { display: "flex", flexDirection: "column", gap: "15px", marginTop:"20px" },
    input: { padding: "10px", border: "1px solid #bbb", borderRadius: "5px" },
    button: { padding: "10px", backgroundColor: "#7b1fa2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    authBtn: { width:"100%", padding:"8px", cursor:"pointer"},
    statusBox: { marginTop: "10px", padding: "10px", backgroundColor: "#fff" }
};

export default Distributor;