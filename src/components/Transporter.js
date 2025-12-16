import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Transporter = () => {
  const [batchId, setBatchId] = useState("");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [location, setLocation] = useState("");
  const [nextOwner, setNextOwner] = useState("");
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
        
        
        await (await contract.registerTransporter(signer.getAddress())).wait();
        setStatus("✅ Registration Successful!");
    } catch(e) { 
        
        setStatus("❌ Authorization Error (or already registered)"); 
    }
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    
    
    const numericTemp = Number(temp);
    const numericHumidity = Number(humidity);

    if(numericTemp < -10 || numericTemp > 40) {
      return setStatus("❌ ERROR: Temperature must be between -10 and 40!");
    }
    if(numericHumidity < 0 || numericHumidity > 40) {
      return setStatus("❌ ERROR: Humidity must be between 0 and 40!");
    }

    try {
      setStatus("⏳ Saving Data...");
      const contract = await connectWallet();
      
      
      const tx = await contract.addSensorData(batchId, numericTemp, numericHumidity, location);
      await tx.wait();
      setStatus(`✅ Data Added! (${numericTemp}°C, %${numericHumidity})`);
    } catch (err) { 
      
      setStatus(`❌ Error: ${err.message.includes("ONLY_TRANSPORTER") ? "Only the Transporter can add sensor data." : err.message}`); 
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
        setStatus("⏳ Transferring to Distributor...");
        const contract = await connectWallet();
        
        
        await (await contract.transferOwnership(batchId, nextOwner)).wait();
        setStatus("✅ Transferred to Distributor!");
    } catch(e) { 
        
        setStatus(`❌ Error: ${e.message.includes("ONLY_TRANSPORTER") ? "Only the Transporter can transfer this batch." : e.message}`); 
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: "#ef6c00"}}>🚚 Transporter Panel</h2>
      <button onClick={handleRegister} style={styles.authBtn}>🔑 Register</button>
      
      <form onSubmit={handleAddData} style={styles.form}>
        <h3>Add Sensor Data</h3>
        <input 
          type="number" 
          placeholder="Batch ID" 
          value={batchId} 
          onChange={e=>setBatchId(e.target.value)} 
          required 
          style={styles.input}
        />
        <div style={{display:"flex", gap:"10px"}}>
            <input 
              type="number" 
              placeholder="Temperature (-10/40°C)" 
              value={temp} 
              onChange={e=>setTemp(e.target.value)} 
              required 
              style={styles.input}
            />
            <input 
              type="number" 
              placeholder="Humidity (0/40%)" 
              value={humidity} 
              onChange={e=>setHumidity(e.target.value)} 
              required 
              style={styles.input}
            />
        </div>
        <input 
          type="text" 
          placeholder="Location" 
          value={location} 
          onChange={e=>setLocation(e.target.value)} 
          required 
          style={styles.input}
        />
        <button type="submit" style={styles.button}>SAVE DATA</button>
      </form>

      <hr/>

      <form onSubmit={handleTransfer} style={styles.form}>
        <h3>Transfer to Distributor</h3>
        <input 
          type="text" 
          placeholder="Distributor Address (0x...)" 
          value={nextOwner} 
          onChange={e=>setNextOwner(e.target.value)} 
          style={styles.input}
        />
        <button type="submit" style={{...styles.button, backgroundColor: "#333"}}>TRANSFER</button>
      </form>
      
      {status && <div style={styles.statusBox}>{status}</div>}
    </div>
  );
};

const styles = {
  container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#fff3e0" },
  form: { display: "flex", flexDirection: "column", gap: "10px", marginTop:"15px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", backgroundColor: "#ef6c00", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  authBtn: { width:"100%", padding:"8px", cursor:"pointer"},
  statusBox: { marginTop: "10px", padding: "10px", backgroundColor: "#fff" }
};

export default Transporter;