import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Admin = () => {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("producer");
  const [status, setStatus] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask is required!");

    try {
      setStatus("⏳ Transaction in progress...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      if (role === "producer") tx = await contract.registerProducer(address);
      else if (role === "transporter") tx = await contract.registerTransporter(address);
      else if (role === "distributor") tx = await contract.registerDistributor(address);
      else if (role === "retailer") tx = await contract.registerRetailer(address);

      await tx.wait();
      setStatus(`✅ ${role.toUpperCase()} successfully registered!`);
    } catch (err) {
      console.error(err);

      setStatus("❌ Error: Only the Admin (Contract Owner) can register users!");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "#d32f2f" }}>🛠️ Admin Panel</h2>
      <p>Register new employees to the system here.</p>
      
      <form onSubmit={registerUser} style={styles.form}>
        <input 
          type="text" 
          placeholder="Wallet Address (0x...)" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required 
          style={styles.input}
        />
        
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="producer">👨‍🌾 Producer</option>
          <option value="transporter">🚚 Transporter</option>
          <option value="distributor">🏭 Distributor</option>
          <option value="retailer">🏪 Retailer</option>
        </select>

        <button type="submit" style={styles.button}>REGISTER</button>
      </form>
      
      {status && <div style={styles.statusBox}>{status}</div>}
    </div>
  );
};

const styles = {
  container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#ffebee" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  statusBox: { marginTop: "10px", padding: "10px", backgroundColor: "#fff", border: "1px solid #ffcdd2" }
};

export default Admin;