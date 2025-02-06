const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

console.log('Starting function...');

// Load vehicles.json (if it exists)
let vehiclesData = {};
try {
    console.log('Loading vehicles.json...');
    const vehiclesArray = JSON.parse(fs.readFileSync(path.join(__dirname, 'api', 'vehicles.json'), 'utf8'));
    // Convert vehiclesArray to an object with vehicle.number as the key
    vehiclesData = vehiclesArray.reduce((acc, vehicle) => {
        acc[vehicle.number] = vehicle;
        return acc;
    }, {});
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
    {
        url: 'https://blakurerno.opter.cloud/api/Positions/VehiclePositions', // Blå Kurér API
        apiKey: '9683030c-3c46-479b-b7f8-abafe0175934',
        logo: '/logo4.png',
        company: 'Blå Kurér',
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

// Helper function to convert "TRUE"/"FALSE" to true/false if needed
function parseIsParticipant(value) {
    if (typeof value === 'boolean') {
        return value;
    }
    return value === 'TRUE'; // Converts "TRUE" to true, "FALSE" to false
}

// Helper function to ensure vehicle number is a string for proper comparison
function ensureString(value) {
    return value.toString();
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

            const vehiclesWithLogos = data.map(vehicle => {
                const vehicleNumber = ensureString(vehicle.number);
                console.log(`Checking vehicle number: ${vehicleNumber}`);
                
                const vehicleData = vehiclesData[vehicleNumber] || {};
                
                if (!vehicleData) {
                    console.log(`No matching data found for vehicle number: ${vehicleNumber}`);
                }

                return {
                    ...vehicle,
                    logo: config.logo,
                    company: config.company,
                    isActiveToday: isActiveToday(vehicle),
                    type: vehicleData.type || 'Unknown',
                    palleplasser: vehicleData.palleplasser || 'Unknown',
                    isParticipant: parseIsParticipant(vehicleData.isParticipant || false)
                };
            });

            allPositions.push(...vehiclesWithLogos);
        }

        console.log('All positions:', allPositions);
        res.json(allPositions);
    } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle positions' });
    }
};