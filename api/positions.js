const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Bygger URL for å hente kjøretøydata
const vehiclesUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/vehicles`;
console.log('Fetching vehicles data from:', vehiclesUrl);

// Konfigurasjoner for eksterne API-er
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
        url: process.env.API_URL_4, // Endret til samme format som de andre selskapene
        apiKey: process.env.API_KEY_4, // Bruker miljøvariabler for Blå Kurér
        logo: '/logo4.png',
        company: 'Blå Kurér',
    },
];

// Sjekker om kjøretøyet er aktivt i dag
function isActiveToday(vehicle) {
    const vehicleTime = new Date(vehicle.time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vehicleTime.setHours(0, 0, 0, 0);
    return vehicleTime.getTime() === today.getTime();
}

// Parser verdien for `isParticipant`
function parseIsParticipant(value) {
    return value === 'TRUE';
}

// Sikrer at verdien er en streng
function ensureString(value) {
    return value ? value.toString() : '';
}

module.exports = async (req, res) => {
    try {
        // Hent data fra /api/vehicles
        console.log('Fetching vehicles data...');
        const vehiclesResponse = await fetch(vehiclesUrl);
        if (!vehiclesResponse.ok) {
            console.error('Failed to fetch vehicles data:', vehiclesResponse.statusText);
            res.status(500).json({ error: 'Failed to fetch vehicles data' });
            return;
        }

        const vehiclesArray = await vehiclesResponse.json();
        console.log('Vehicles data loaded successfully:', vehiclesArray);

        // Konverter vehiclesArray til et oppslag (object) basert på kjøretøynummer
        const vehiclesData = vehiclesArray.reduce((acc, vehicle) => {
            acc[vehicle.number] = vehicle;
            return acc;
        }, {});

        console.log('Fetching vehicle positions...');
        const allPositions = [];

        // Loop gjennom API-konfigurasjonene for å hente posisjonsdata
        for (const config of apiConfigurations) {
            try {
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

                // Legg til logoer, firma og kjøretøyinfo
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
            } catch (error) {
                console.error(`Error processing data from ${config.url}:`, error.message);
            }
        }

        console.log('All positions processed successfully:', allPositions);
        res.json(allPositions);
    } catch (error) {
        console.error('Error fetching vehicle positions:', error.message);
        res.status(500).json({ error: 'Failed to fetch vehicle positions' });
    }
};





