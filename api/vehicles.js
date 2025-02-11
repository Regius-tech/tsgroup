const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    // Legg til CORS-headere
    res.setHeader('Access-Control-Allow-Origin', '*'); // Tillater alle domener
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Tillater spesifikke HTTP-metoder
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Tillater spesifikke headere

    // Returner tidlig ved en OPTIONS-forespørsel (preflight-request)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const filePath = path.join(__dirname, 'vehicleData.json'); // Oppdatert med nytt filnavn

    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const vehiclesData = JSON.parse(fileContents);

        res.status(200).json(vehiclesData); // Returner kjøretøydata
    } catch (error) {
        console.error('Error reading vehicleData.json:', error);
        res.status(500).json({ error: 'Failed to load vehicleData.json' });
    }
};





