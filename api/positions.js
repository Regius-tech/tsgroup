const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

console.log('Starting function...');

// Load vehicles.json (if it exists)
let vehiclesData = {};
try {
    console.log('Loading vehicles.json...');
    vehiclesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'vehicles.json'), 'utf8'));
    console.log('vehicles.json loaded successfully:', vehiclesData);
} catch (error) {
    console.warn('vehicles.json not found or invalid. Proceeding without it.');
}

// API configurations
const apiConfigurations = [
    {
        url: process.env.API_URL_1,
        apiKey: process.env.API_KEY_1,
        logo: '/logo1.png',
        company: 'Transportsentralen Oslo',
    },
    {
        url: process.env.API_URL_2,
        apiKey: process.env.API_KEY_2,
        logo: '/logo2.png',
        company: 'TS Oslo Budtjenester',
    },
    {
        url: process.env.API_URL_3,
        apiKey: process.env.API_KEY_3,
        logo: '/logo3.png',
        company: 'Moss Transportforum',
    },
];

console.log('API configurations:', apiConfigurations);

// Helper function to check if a vehicle is active today
function isActiveToday(vehicle) {
    const vehicleTime = new Date(vehicle.time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vehicleTime.setHours(0, 0, 0, 0);
    return vehicleTime.getTime() === today.getTime();
}

module.exports = async (req, res) => {
    try {
        console.log('Fetching vehicle positions...');
        const allPositions = [];

        for (const config of apiConfigurations) {
            console.log(`Fetching data from: ${config.url}`);
            const response = await fetch(config.url, {
                method: 'GET',
                headers: { 'x-api-key': config.apiKey },
            });

            if (!response.ok) {
                console.error(`Error fetching data from ${config.url}:`, response.statusText);
                continue;
            }

            const data = await response.json();
            console.log(`Data fetched from ${config.url}:`, data);

            const vehiclesWithLogos = data.map(vehicle => ({
                ...vehicle,
                logo: config.logo,
                company: config.company,
                isActiveToday: isActiveToday(vehicle),
                type: vehiclesData[vehicle.number]?.type || 'Unknown',
                palleplasser: vehiclesData[vehicle.number]?.palleplasser || 'Unknown',
                isParticipant: vehiclesData[vehicle.number]?.isParticipant ?? false // 🆕 Henter isParticipant fra vehicles.json, fallback = false
            }));

            allPositions.push(...vehiclesWithLogos);
        }

        console.log('All positions:', allPositions);
        res.json(allPositions);
    } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle positions' });
    }
};
