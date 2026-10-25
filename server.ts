import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_CAMPUS_LOCATIONS } from './src/data/campusNavigationData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory server-side location store initialized from verified GNI campus dataset
let serverCampusLocations = [...INITIAL_CAMPUS_LOCATIONS];

// Helper: Haversine distance in meters
function computeHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CampusPulse Full-Stack API',
    locationsCount: serverCampusLocations.length,
    timestamp: new Date().toISOString()
  });
});

// Google Maps Client Config
app.get('/api/config/maps', (_req: Request, res: Response) => {
  const key =
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyC1TLpZmY-0BEI8cdVLCH3qwIG6v4hlwOo';
  res.json({ apiKey: key });
});

// Campus Locations: List & Filter
app.get('/api/campus-locations', (req: Request, res: Response) => {
  const { q, category, institution, verified } = req.query;
  let results = [...serverCampusLocations];

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter((loc) => loc.category === category);
  }

  if (institution && typeof institution === 'string' && institution !== 'All') {
    results = results.filter((loc) =>
      (loc.institutionName || '').toLowerCase().includes(institution.toLowerCase())
    );
  }

  if (verified === 'true') {
    results = results.filter((loc) => loc.coordinatesVerified);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(
      (loc) =>
        loc.name.toLowerCase().includes(term) ||
        ((loc.building || loc.buildingName || '').toLowerCase().includes(term)) ||
        loc.category.toLowerCase().includes(term) ||
        (loc.departmentName && loc.departmentName.toLowerCase().includes(term)) ||
        (loc.searchKeywords && loc.searchKeywords.some((k) => k.toLowerCase().includes(term))) ||
        (loc.landmarks && loc.landmarks.toLowerCase().includes(term))
    );
  }

  res.json({
    count: results.length,
    total: serverCampusLocations.length,
    locations: results
  });
});

// Campus Locations: Get by ID
app.get('/api/campus-locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const match = serverCampusLocations.find((loc) => loc.id === id);
  if (!match) {
    res.status(404).json({ error: 'Campus location not found', id });
    return;
  }
  res.json(match);
});

// Campus Locations: Create
app.post('/api/campus-locations', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.building || !body.category || body.latitude === undefined || body.longitude === undefined) {
    res.status(400).json({ error: 'Missing mandatory fields: name, building, category, latitude, longitude' });
    return;
  }

  const newLocation = {
    ...body,
    id: body.id || `loc-${Date.now()}`,
    coordinatesVerified: body.coordinatesVerified ?? true,
    navigationEnabled: body.navigationEnabled ?? true,
    createdAt: new Date().toISOString()
  };

  serverCampusLocations.unshift(newLocation);
  res.status(201).json(newLocation);
});

// Campus Locations: Update
app.put('/api/campus-locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = serverCampusLocations.findIndex((loc) => loc.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Location not found' });
    return;
  }

  serverCampusLocations[index] = {
    ...serverCampusLocations[index],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };

  res.json(serverCampusLocations[index]);
});

// Campus Locations: Delete
app.delete('/api/campus-locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const beforeCount = serverCampusLocations.length;
  serverCampusLocations = serverCampusLocations.filter((loc) => loc.id !== id);
  if (serverCampusLocations.length === beforeCount) {
    res.status(404).json({ error: 'Location not found' });
    return;
  }
  res.json({ message: 'Location deleted successfully', id });
});

// Campus Locations: Seed / Reset to verified defaults
app.post('/api/campus-locations/seed', (_req: Request, res: Response) => {
  serverCampusLocations = [...INITIAL_CAMPUS_LOCATIONS];
  res.json({
    message: 'Campus locations seeded successfully with verified GNI dataset',
    count: serverCampusLocations.length
  });
});

// Walking Navigation & Directions API
app.get('/api/campus-navigation/directions', (req: Request, res: Response) => {
  const { originId, destId, fromLat, fromLng, toLat, toLng } = req.query;

  let startLat: number | undefined;
  let startLng: number | undefined;
  let startName = 'Current Location';
  let destLat: number | undefined;
  let destLng: number | undefined;
  let destName = 'Destination';
  let fromLoc = originId ? serverCampusLocations.find((l) => l.id === originId) : undefined;
  let toLoc = destId ? serverCampusLocations.find((l) => l.id === destId) : undefined;

  if (fromLoc) {
    startLat = fromLoc.latitude;
    startLng = fromLoc.longitude;
    startName = fromLoc.name;
  } else if (fromLat && fromLng) {
    startLat = parseFloat(fromLat as string);
    startLng = parseFloat(fromLng as string);
  }

  if (toLoc) {
    destLat = toLoc.latitude;
    destLng = toLoc.longitude;
    destName = toLoc.name;
  } else if (toLat && toLng) {
    destLat = parseFloat(toLat as string);
    destLng = parseFloat(toLng as string);
  }

  if (startLat === undefined || startLng === undefined || destLat === undefined || destLng === undefined) {
    res.status(400).json({
      error: 'Please provide valid start and destination locations or coordinates'
    });
    return;
  }

  const directDistance = computeHaversineDistance(startLat, startLng, destLat, destLng);
  // Walking route factor along campus paved pedestrian avenues (1.25x direct distance)
  const walkingDistanceMeters = Math.max(30, Math.round(directDistance * 1.25));
  // Walking speed approx 75 meters / minute (4.5 km/h)
  const estimatedMinutes = Math.max(1, Math.round(walkingDistanceMeters / 75));

  const steps = [
    {
      instruction: `Begin journey at ${startName}. Follow paved campus walkway toward central promenade.`,
      approxMinutes: 1,
      type: 'start'
    },
    {
      instruction: 'Proceed along Guru Nanak Institutions pedestrian avenue toward central quadrangle.',
      approxMinutes: Math.max(1, Math.round(estimatedMinutes * 0.4)),
      type: 'walk'
    },
    {
      instruction: toLoc?.floor && toLoc.floor !== 'Ground Floor'
        ? `Enter ${toLoc?.building || 'building'} via main foyer and proceed to ${toLoc.floor} via staircase or elevator.`
        : `Arrive at entrance of ${destName}.`,
      approxMinutes: Math.max(1, Math.round(estimatedMinutes * 0.4)),
      type: 'arrive'
    }
  ];

  res.json({
    from: { name: startName, lat: startLat, lng: startLng },
    to: { name: destName, lat: destLat, lng: destLng },
    distanceMeters: walkingDistanceMeters,
    estimatedMinutes,
    steps,
    waypoints: [
      { lat: startLat, lng: startLng },
      { lat: (startLat + destLat) / 2, lng: (startLng + destLng) / 2 },
      { lat: destLat, lng: destLng }
    ]
  });
});

// Server-side AI Academic Doubt Resolution (Proxy Route keeping keys secure)
app.post('/api/ai-doubt', async (req: Request, res: Response) => {
  const { subject, agentName, question, codeSnippet, level } = req.body;

  if (!question || !subject) {
    res.status(400).json({ error: 'Missing subject or question in request body' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // If runtime key is not provided, return helpful server-level guidance
    res.json({
      reply: `### 💡 ${agentName || 'Faculty Mentor'} Academic Insights\n\n**Subject**: ${subject}\n**Topic**: ${question}\n\n*Invariants & Core Analysis*:\n1. Verify edge conditions and input constraints.\n2. Trace operation workflows across states.\n3. Compute time & space complexity for institutional scoring.\n\n*(Note: To unlock live AI generative streaming, provide GEMINI_API_KEY in server secrets)*`
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are ${agentName || 'an experienced University Professor and Academic Mentor'} specializing in ${subject}.
A university engineering student has asked the following technical doubt:

Question: ${question}
${codeSnippet ? `Student's Code Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}
${level ? `Target Level: ${level}` : ''}

Provide a pedagogically sound, structured response containing:
1. Conceptual Intuition (the "Why" and underlying theory)
2. Methodical Walkthrough / Invariants
3. Concrete Implementation Snippet (concise, high-standard code)
4. Examination & Competitive Exam Tips
5. Challenge Problem for self-testing

Keep tone encouraging, rigorous, and clear. Format cleanly with Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini API resolution error:', error?.message || error);
    res.status(500).json({
      error: 'Failed to generate academic response',
      details: error?.message || String(error)
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CampusPulse full-stack server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
