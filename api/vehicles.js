const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    const filePath = path.join(__dirname, 'vehicles.json'); // Oppdatert til samme mappe

    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const vehiclesData = JSON.parse(fileContents);

        res.status(200).json(vehiclesData); // Returner kjøretøydata
    } catch (error) {
        console.error('Error reading vehicles.json:', error);
        res.status(500).json({ error: 'Failed to load vehicles.json' });
    }
};



