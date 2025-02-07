const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'vehicles.json');
        const vehiclesData = fs.readFileSync(filePath, 'utf8');

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(vehiclesData);
    } catch (error) {
        console.error('Error reading vehicles.json:', error);
        res.status(500).json({ error: 'Failed to read vehicles.json' });
    }
};
