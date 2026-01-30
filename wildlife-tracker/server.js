/********************************************************************************
* WEB322 - Assignment 01
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: ______________________ Student ID: ______________ Date: ______________
*
********************************************************************************/

const express = require("express");
const path = require("path");
const fs = require("fs");
const { loadSightings } = require("./utils/dataLoader");

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Root route -> serve the about page
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "views", "index.html");

  // this helps you catch the real problem (missing file / wrong folder)
  if (!fs.existsSync(filePath)) {
    console.log("ERROR: index.html not found at:", filePath);
    return res
      .status(500)
      .send("index.html not found. Check your views folder/path.");
  }

  res.sendFile(filePath);
});

// -------------------- API ENDPOINTS --------------------

// Get all sightings
app.get("/api/sightings", async (req, res) => {
  try {
    const sightings = await loadSightings();
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verified sightings only
app.get("/api/sightings/verified", async (req, res) => {
  try {
    const sightings = await loadSightings();
    res.json(sightings.filter((s) => s.verified === true));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unique species list
app.get("/api/sightings/species-list", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const speciesNames = sightings.map((s) => s.species);
    res.json([...new Set(speciesNames)]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forest habitat + count
app.get("/api/sightings/habitat/forest", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const forestSightings = sightings.filter((s) => s.habitat === "forest");
    res.json({ habitat: "forest", sightings: forestSightings, count: forestSightings.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search eagle (case-insensitive)
app.get("/api/sightings/search/eagle", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const found = sightings.find((s) =>
      String(s.species).toLowerCase().includes("eagle")
    );

    if (!found) return res.status(404).json({ message: "No eagle sighting found." });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find index moose
app.get("/api/sightings/find-index/moose", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const idx = sightings.findIndex((s) => s.species === "Moose");

    if (idx === -1) return res.status(404).json({ index: -1, message: "Moose not found." });

    res.json({ index: idx, sighting: sightings[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent 3 sightings (your data has "date", so this is fine)
app.get("/api/sightings/recent", async (req, res) => {
  try {
    const sightings = await loadSightings();

    const sorted = [...sightings].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const top3 = sorted.slice(0, 3).map((s) => ({
      id: s.id,
      species: s.species,
      location: s.location,
      habitat: s.habitat,
      date: s.date,
      verified: s.verified
    }));

    res.json(top3);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Basic 404 handler (helps debugging)
app.use((req, res) => {
  res.status(404).send("Route not found.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Open:", `http://localhost:${PORT}/`);
});
