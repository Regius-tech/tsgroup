const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

console.log('Starting function...'); // Debugging

// Load vehicles.json (if it exists)
let vehiclesData = {};
try {
    console.log('Loading vehicles.json...'); // Debugging
    vehiclesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'vehicles.json'), 'utf8'));
    console.log('vehicles.json loaded successfully:', vehiclesData); // Debugging
} catch (error) {
    console.warn('vehicles.json not found or invalid. Proceeding without it.'); // Debugging
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

console.log('API configurations:', apiConfigurations); // Debugging

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
        console.log('Fetching vehicle positions...'); // Debugging
        const allPositions = [];
        for (const config of apiConfigurations) {
            console.log(`Fetching data from: ${config.url}`); // Debugging
            const response = await fetch(config.url, {
                method: 'GET',
                headers: { 'x-api-key': config.apiKey },
            });
            if (!response.ok) {
                console.error(`Error fetching data from ${config.url}:`, response.statusText);
                continue;
            }
            const data = await response.json();
            console.log(`Data fetched from ${config.url}:`, data); // Debugging
            const vehiclesWithLogos = data.map(vehicle => ({
                ...vehicle,
                logo: config.logo,
                company: config.company,
                isActiveToday: isActiveToday(vehicle),
                type: vehiclesData[vehicle.number]?.type || 'Unknown', // Fallback to 'Unknown' if vehicles.json is missing
                palleplasser: vehiclesData[vehicle.number]?.palleplasser || 'Unknown', // Fallback to 'Unknown' if vehicles.json is missing
            }));
            allPositions.push(...vehiclesWithLogos);
        }
        console.log('All positions:', allPositions); // Debugging
        res.json(allPositions);
    } catch (error) {
        console.error('Error fetching vehicle positions:', error); // Debugging
        res.status(500).json({ error: 'Failed to fetch vehicle positions' });
    }
};