// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract FreshChain {
    
    // --- Data Structures ---
    
    struct SensorLog {
        uint256 timestamp;
        int256 temperature;
        int256 humidity;
        string location;
        address recordedBy;
    }

    struct Batch {
        uint256 batchId;
        string productName;
        uint256 quantity;
        address currentOwner;
        address producer; // Original creator
        bool isFinalized; // True if retailer accepts it
        bool passedInspection;
        bool isViolated; // YENİLİK: Kalite İhlali Bayrağı eklendi
        SensorLog[] sensorLogs;
        address[] ownershipHistory; // Tracks path: Farmer -> Transporter -> ...
    }

    // --- State Variables ---
    address public owner; // The Admin
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => bool) public batchExists;
    
    // Role Mappings
    mapping(address => bool) public producers;
    mapping(address => bool) public transporters;
    mapping(address => bool) public distributors;
    mapping(address => bool) public retailers;

    // --- Events ---
    event BatchCreated(uint256 batchId, string productName, uint256 quantity, address indexed producer);
    event SensorDataAdded(uint256 batchId, int256 temp, int256 humidity, string location, uint256 timestamp, bool isViolated); // isViolated eklendi
    event OwnershipTransferred(uint256 batchId, address indexed previousOwner, address indexed newOwner);
    event BatchFinalized(uint256 batchId, bool passedInspection);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only Admin can perform this action");
        _;
    }

    modifier onlyProducer() {
        require(producers[msg.sender], "Caller is not a registered Producer");
        _;
    }
    
    // Transporter, Distributor ve Retailer'ın da kendi rollerini kontrol edebilmesi için basit bir kontrol
    modifier onlyActor() {
        require(producers[msg.sender] || transporters[msg.sender] || distributors[msg.sender] || retailers[msg.sender], "Caller is not a registered Actor");
        _;
    }

    modifier onlyTransporter() {
        require(transporters[msg.sender], "Caller is not a registered Transporter");
        _;
    }

    modifier onlyRetailer() {
        require(retailers[msg.sender], "Caller is not a registered Retailer");
        _;
    }

    // --- Constructor ---
    constructor() {
        owner = msg.sender; // Deployer is the Admin
    }

    // --- 1. Register Supply Chain Actors ---

    function registerProducer(address producer) external onlyOwner {
        producers[producer] = true;
    }

    function registerTransporter(address transporter) external onlyOwner {
        transporters[transporter] = true;
    }

    function registerDistributor(address distributor) external onlyOwner {
        distributors[distributor] = true;
    }

    function registerRetailer(address retailer) external onlyOwner {
        retailers[retailer] = true;
    }

    // --- 2. Create Product Batch ---

    function createBatch(uint256 batchId, string memory productName, uint256 quantity) external onlyProducer {
        require(!batchExists[batchId], "Batch ID already exists");
        require(quantity > 0, "Quantity must be greater than zero");

        Batch storage newBatch = batches[batchId];
        newBatch.batchId = batchId;
        newBatch.productName = productName;
        newBatch.quantity = quantity;
        newBatch.currentOwner = msg.sender;
        newBatch.producer = msg.sender;
        newBatch.isFinalized = false;
        newBatch.isViolated = false; // YENİLİK: Başlangıçta ihlal yok
        
        // Add creator to history
        newBatch.ownershipHistory.push(msg.sender);
        batchExists[batchId] = true;

        emit BatchCreated(batchId, productName, quantity, msg.sender);
    }

    // --- 3. Record Environmental Data ---

    function addSensorData(
        uint256 batchId,
        int256 temperature,
        int256 humidity,
        string memory location
    ) 
        external 
        onlyTransporter // Sadece Transporter çağırabilir
    {
        require(batchExists[batchId], "Batch does not exist");
        require(batches[batchId].currentOwner == msg.sender, "Must be the current owner to add data");

        // YENİLİK: Veri Doğrulama (Sıcaklık: -10/+40, Nem: 0/40)
        require(temperature >= -10 && temperature <= 40, "TEMP_OUT_OF_RANGE (-10 to 40)");
        require(humidity >= 0 && humidity <= 40, "HUMIDITY_OUT_OF_RANGE (0 to 40)");

        
        batches[batchId].sensorLogs.push(
            SensorLog({
                recordedBy: msg.sender,
                temperature: temperature,
                humidity: humidity,
                location: location,
                timestamp: block.timestamp 
            })
        );

        emit SensorDataAdded(batchId, temperature, humidity, location, block.timestamp, batches[batchId].isViolated); 
    }

    // --- 4. Ownership Transfer ---

    function transferOwnership(uint256 batchId, address newOwner) external onlyActor {
        require(batchExists[batchId], "Batch does not exist");

        require(batches[batchId].currentOwner == msg.sender, "You are not the current owner of the batch");
        
        require(!batches[batchId].isFinalized, "Cannot transfer finalized batch");
        require(newOwner != address(0), "Invalid new owner address");
        
        require(producers[newOwner] || transporters[newOwner] || distributors[newOwner] || retailers[newOwner], "New owner is not a registered actor");

        address previousOwner = batches[batchId].currentOwner;
        batches[batchId].currentOwner = newOwner;
        batches[batchId].ownershipHistory.push(newOwner);

        emit OwnershipTransferred(batchId, previousOwner, newOwner);
    }

    // --- 5. Retailer Final Inspection ---

    function markAsArrived(uint256 batchId, bool passedInspection) external onlyRetailer {
        require(batchExists[batchId], "Batch does not exist");
        require(batches[batchId].currentOwner == msg.sender, "Retailer must own the batch");
        require(!batches[batchId].isFinalized, "Batch already finalized");

        batches[batchId].isFinalized = true;
        batches[batchId].passedInspection = passedInspection;

        emit BatchFinalized(batchId, passedInspection);
    }

    // --- 6. Customer View Function ---
    // YENİLİK: isViolated bayrağını çıktıya ekledik
    function getBatchHistory(uint256 batchId) public view returns (
        string memory name,
        uint256 quantity,
        address producer,
        address currentOwner,
        bool isFinalized,
        bool passedInspection,
        bool isViolated, // YENİ: Kalite ihlali bayrağı
        address[] memory history,
        SensorLog[] memory logs
    ) {
        require(batchExists[batchId], "Batch does not exist");
        Batch storage b = batches[batchId];
        return (
            b.productName,
            b.quantity,
            b.producer,
            b.currentOwner,
            b.isFinalized,
            b.passedInspection,
            b.isViolated, // Yeni değer döndürüldü
            b.ownershipHistory,
            b.sensorLogs
        );
    }
}