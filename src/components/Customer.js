import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Customer = () => {
    const [batchId, setBatchId] = useState("");
    const [batchData, setBatchData] = useState(null);
    const [status, setStatus] = useState("");

    const getBatchDetails = async (e) => {
        e.preventDefault();
        
        // MetaMask gereksinim kontrolü
        if (!window.ethereum) return setStatus("❌ MetaMask is required to query the blockchain!"); 

        try {
            setStatus("🔍 Searching...");
            setBatchData(null);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            
            // Kontrattan tüm verileri çekme
            // Kontrat dönüş sırası (getBatchHistory): 0:name, 1:quantity, 2:producer, 3:currentOwner, 4:isFinalized, 5:passedInspection, 6:isViolated, 7:ownershipHistory, 8:sensorLogs
            const data = await contract.getBatchHistory(batchId);
            
            // 🚨 KRİTİK DÜZELTME 1: logs, dizinin 9. elemanıdır (index 8)
            const logs = data[8]; 
            let lastLog = { temp: "-", hum: "-", loc: "Unknown", time: "N/A" }; 

            if (logs && logs.length > 0) {
                const latest = logs[logs.length - 1]; 
                
                // 🚨 KRİTİK DÜZELTME 2: SensorLog Struct yapısı (timestamp[0], temp[1], humidity[2], location[3], recordedBy[4])
                
                // ZAMAN DAMGASI DÜZELTİLDİ (latest[0])
                const unixTimestamp = Number(latest[0].toString()); 
                
                // Tarih Hatası Düzeltme (01.01.1970)
                const readableTime = (unixTimestamp > 0) 
                    ? new Date(unixTimestamp * 1000).toLocaleString('tr-TR', { 
                        year: 'numeric', 
                        month: 'numeric', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                    : "N/A (Veri Yok)";

                // SAYISAL VE KONUM VERİLERİ DÜZELTİLDİ
                lastLog = {
                    temp: latest[1].toString(), // Sıcaklık (Index 1)
                    hum: latest[2].toString(), // Nem (Index 2)
                    loc: latest[3],           // Konum (Index 3)
                    time: readableTime         
                };
            }
            
            // Diğer verilerin atanması (İndisler 0'dan 7'ye kadar)
            
            // Kalite İhlali Kontrolü (Index 6)
            const violation = data[6] ? "🚨 QUALITY ALERT: Violated Limits" : "🟢 OK";
            
            // Durum kontrolü (Index 4: isFinalized, Index 5: passedInspection)
            const stateText = data[4] ? "✅ Finalized" : "🚚 In Transit";
            const inspectionText = data[5] ? "✅ Retailer Approved" : "⏳ Awaiting Approval";

            setBatchData({
                id: batchId,
                name: data[0], 
                quantity: data[1].toString(), // BigInt'i string'e çevirme
                transporter: data[3],
                logs: lastLog, 
                state: stateText, 
                inspection: inspectionText,
                violation: violation, 
            });
            setStatus("✅ Data Found!");
        } catch (error) {
            console.error("Query Error:", error);
            setStatus("❌ Data not found. (Check console for details)");
        }
    };
    
    // JSX ve Stiller (Değiştirilmedi)
    const styles = {
        container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#e3f2fd", textAlign: "center" },
        form: { display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" },
        input: { padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc", width: "60%" },
        button: { padding: "10px", backgroundColor: "#1565c0", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
        card: { marginTop: "20px", padding: "15px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", textAlign: "left" }
    };
    
    return (
        <div style={styles.container}>
            <h2 style={{ color: "#1565c0" }}>🛒 Customer Query</h2>
            
            <form onSubmit={getBatchDetails} style={styles.form}>
                <input 
                    type="number" 
                    placeholder="Product ID" 
                    value={batchId} 
                    onChange={(e) => setBatchId(e.target.value)} 
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>QUERY</button>
            </form>

            {/* Status mesajı */}
            {status && <p style={{fontWeight:"bold", color: status.startsWith("❌") ? "red" : status.startsWith("✅") ? "green" : "gray"}}>{status}</p>}

            {batchData && (
                <div style={styles.card}>
                    <h3>📦 {batchData.name}</h3>
                    <p><strong>Quantity:</strong> {batchData.quantity} kg</p>
                    <p><strong>Status:</strong> {batchData.state}</p>
                    
                    {/* Kalite İhlali Gösterimi */}
                    <p style={{color: batchData.violation.startsWith("🚨") ? "red" : "green", fontWeight: "bold"}}>
                        <strong>Quality Check:</strong> {batchData.violation}
                    </p>
                    
                    <p><strong>Retailer Check:</strong> {batchData.inspection}</p>
                    <hr/>
                    <h4>🌡️ Latest Sensor Data</h4>
                    <p><strong>Temperature:</strong> {batchData.logs.temp} °C</p>
                    <p><strong>Humidity:</strong> %{batchData.logs.hum}</p>
                    <p><strong>Location:</strong> {batchData.logs.loc}</p>
                    
                    {/* Zaman Damgası gösterimi */}
                    <p><strong>Recorded On:</strong> {batchData.logs.time}</p> 
                    
                </div>
            )}
        </div>
    );
};

export default Customer;