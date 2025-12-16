import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { QRCodeSVG } from 'qrcode.react'; // QR Kod kütüphanesi eklendi

const Producer = () => {
    // Mevcut state'ler
    const [id, setId] = useState("");
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    
    const [transferId, setTransferId] = useState("");
    const [transporterAddress, setTransporterAddress] = useState("");
    const [status, setStatus] = useState("");
    
    // YENİ: QR Kod URL'si için state
    const [generatedQrUrl, setGeneratedQrUrl] = useState(""); 

    const connectWallet = async () => {
        if (!window.ethereum) throw new Error("MetaMask is required!");
        // ethers v6 ile provider oluşturma
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            setStatus("⏳ Transaction in progress...");
            setGeneratedQrUrl(""); // Yeni işlem başlatılırken eski QR kodunu temizle

            const contract = await connectWallet();
            // ID'yi BigNumber veya string olarak kullanmak yerine, kontratınızın beklediği tipe çevirin.
            // Solidity'de genellikle uint kullanılır, bu yüzden Number() kullanıyoruz.
            const batchIdNumber = Number(id); 

            const tx = await contract.createBatch(batchIdNumber, productName, quantity);
            await tx.wait();
            
            setStatus(`✅ Batch #${batchIdNumber} created successfully!`);
            
            // QR Kodu için URL oluşturma: Müşteri sayfanızın URL'sini ve Batch ID'yi içerir.
            const customerPageBaseUrl = window.location.origin + "/customer"; 
            const qrDataUrl = `${customerPageBaseUrl}?batchId=${batchIdNumber}`;
            setGeneratedQrUrl(qrDataUrl); // QR kodun oluşturulacağı URL'yi kaydet
            
            // Formu temizle (ID hariç)
            setProductName("");
            setQuantity("");
            
        } catch (err) { 
            console.error("Batch Creation Error:", err);
            // Hata mesajını daha anlaşılır hale getirme (Kontratınızdaki require mesajlarına göre özelleştirilebilir)
            let errorMsg = "Transaction failed.";
            if (err.message.includes("ONLY_PRODUCER") || err.message.includes("is not a registered Producer")) {
                 errorMsg = "Only a registered Producer can create a batch.";
            } else if (err.message.includes("Batch ID already exists")) {
                 errorMsg = `Batch #${id} already exists.`;
            } else {
                 errorMsg = err.reason || err.message;
            }

            setStatus(`❌ Error: ${errorMsg}`); 
            setGeneratedQrUrl("");
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            setStatus("⏳ Transferring to Transporter...");
            const contract = await connectWallet();
            
            const tx = await contract.transferOwnership(Number(transferId), transporterAddress);
            await tx.wait();
            
            setStatus(`✅ Batch #${transferId} transferred to Transporter!`);
            setGeneratedQrUrl(""); // Transferden sonra QR kodu temizle

        } catch (err) { 
            console.error("Transfer Error:", err);
            // Hata mesajını iyileştirme
            let errorMsg = "Transfer failed.";
            if (err.message.includes("ONLY_PRODUCER")) {
                errorMsg = "Only the current owner can transfer this batch.";
            } else if (err.message.includes("Batch does not exist")) {
                errorMsg = "Batch ID does not exist.";
            } else {
                 errorMsg = err.reason || err.message;
            }

            setStatus(`❌ Error: ${errorMsg}`);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{color: "#2e7d32"}}>👨‍🌾 Producer Panel</h2>
            
            {/* --- 1. Create Product Batch Form --- */}
            <form onSubmit={handleCreateBatch} style={styles.form}>
                <h3>1. Create Product Batch</h3>
                <input 
                    type="number" 
                    placeholder="Batch ID" 
                    value={id} 
                    onChange={e=>setId(e.target.value)} 
                    required 
                    style={styles.input}
                />
                <input 
                    type="text" 
                    placeholder="Product Name" 
                    value={productName} 
                    onChange={e=>setProductName(e.target.value)} 
                    required 
                    style={styles.input}
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={quantity} 
                    onChange={e=>setQuantity(e.target.value)} 
                    required 
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>SAVE BATCH</button>
            </form>
            
            {/* YENİ: QR Kod Gösterim Alanı */}
            {generatedQrUrl && (
                <div style={styles.qrCard}>
                    <h4>✅ Batch Created. Scan for Traceability:</h4>
                    <QRCodeSVG 
                        value={generatedQrUrl} 
                        size={150} 
                        level="H" 
                        includeMargin={true}
                        style={{marginTop: '10px'}}
                    />
                    <p style={{fontSize: '0.8em', marginTop: '10px'}}>
                        **URL:** <a href={generatedQrUrl} target="_blank" rel="noopener noreferrer" style={{wordBreak: 'break-all'}}>{generatedQrUrl}</a>
                    </p>
                </div>
            )}
            
            <hr style={{margin: '30px 0'}}/>
            
            {/* --- 2. Transfer to Transporter Form --- */}
            <form onSubmit={handleTransfer} style={styles.form}>
                <h3>2. Transfer to Transporter</h3>
                <input 
                    type="number" 
                    placeholder="Batch ID" 
                    value={transferId} 
                    onChange={e=>setTransferId(e.target.value)} 
                    style={styles.input}
                    required
                />
                <input 
                    type="text" 
                    placeholder="Transporter Address (0x...)" 
                    value={transporterAddress} 
                    onChange={e=>setTransporterAddress(e.target.value)} 
                    style={styles.input}
                    required
                />
                <button type="submit" style={{...styles.button, backgroundColor: "#1976d2"}}>TRANSFER</button>
            </form>
            
            {status && <div style={styles.statusBox}>{status}</div>}
        </div>
    );
};

const styles = {
    container: { maxWidth: "500px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#fff" },
    form: { display: "flex", flexDirection: "column", gap: "10px" },
    input: { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
    button: { padding: "10px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    statusBox: { marginTop: "10px", padding: "10px", backgroundColor: "#e8f5e9", borderLeft: '3px solid #2e7d32', fontWeight: 'bold' },
    // YENİ QR KOD STİLİ
    qrCard: { marginTop: "20px", padding: "15px", backgroundColor: "#f0fff4", border: '1px dashed #2e7d32', borderRadius: "8px", textAlign: 'center' }
};

export default Producer;