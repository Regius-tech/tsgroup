const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Lag riktig URL for vehicles.json
const vehiclesUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/vehicles.json`;

console.log('Fetching vehicles.json from:', vehiclesUrl);

// API-konfigurasjoner
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
        url: 'https://blakurerno.opter.cloud/api/Positions/VehiclePositions',
        apiKey: '9683030c-3c46-479b-b7f8-abafe0175934',
        logo: '/logo4.png',
        company: 'Blå Kurér',
    },
];

// Funksjon for å sjekke om et kjøretøy er aktivt i dag
function isActiveToday(vehicle) {
    const vehicleTime = new Date(vehicle.time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vehicleTime.setHours(0, 0, 0, 0);
    return vehicleTime.getTime() === today.getTime();
}

// Funksjon for å parse "TRUE"/"FALSE" til boolean
function parseIsParticipant(value) {
    return value === 'TRUE';
}

// Sikre at kjøretøynummer er en streng
function ensureString(value) {
    return value.toString();
}

module.exports = async (req, res) => {
    try {
        console.log('Fetching vehicles.json...');
        const vehiclesResponse = await fetch(vehiclesUrl);
        if (!vehiclesResponse.ok) {
            console.error('Failed to fetch vehicles.json:', vehiclesResponse.statusText);
            res.status(500).json({ error: 'Failed to fetch vehicles.json' });
            return;
        }

        const vehiclesArray = await vehiclesResponse.json();
        console.log('vehicles.json loaded successfully:', vehiclesArray);

        const vehiclesData = vehiclesArray.reduce((acc, vehicle) => {
            acc[vehicle.number] = vehicle;
            return acc;
        }, {});

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
                const vehicleData = vehiclesData[vehicleNumber] || {};

                return {
                    ...vehicle,
                    logo: config.logo,
                    company: config.company,
                    isActiveToday: isActiveToday(vehicle),
                    type: vehicleData.type || 'Unknown',
                    palleplasser: vehicleData.palleplasser || 'Unknown',
                    isParticipant: parseIsParticipant(vehicleData.isParticipant || 'FALSE'),
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



