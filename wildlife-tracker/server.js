/********************************************************************************
* WEB322 - Assignment 01
*
* I declare that this assignment is my own work in accordance with Seneca
* Polytechnic’s Academic Integrity Policy.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Onyinyechi Rita Ngaokere
* Student ID: 173949231
* Date: January 29, 2026
*
* What I did in this assignment:
* - I created an Express server to serve static files and API endpoints.
* - I used modular data loading by importing loadSightings from dataLoader.js.
* - I implemented multiple REST API routes to filter, search, and sort wildlife data.
* - I added proper error handling and a 404 route to handle invalid requests.
* - I configured the app so it works both locally and on Vercel.
*
********************************************************************************/

const express = require("express");
const path = require("path");
const fs = require("fs");
const { loadSightings } = require("./utils/dataLoader");

const app = express();

// I used process.env.PORT for deployment and I kept a local fallback
// (I changed the local fallback to 3000 because it's the common default)
const PORT = process.env.PORT || 3000;

// I used this to serve all static assets like CSS and images
app.use(express.static(path.join(__dirname, "public")));

// When the user visits the root URL, I send the main index.html page
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "views", "index.html");

  // I added this check to help me debug path issues if the file is missing
  if (!fs.existsSync(filePath)) {
    console.log("ERROR: index.html not found at:", filePath);
    return res
      .status(500)
      .send("index.html not found. Please check the views folder.");
  }

  res.sendFile(filePath);
});

// -------------------- API ROUTES --------------------

// I created this route to return all wildlife sightings
app.get("/api/sightings", async (req, res) => {
  try {
    const sightings = await loadSightings();
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I used this route to return only verified sightings
app.get("/api/sightings/verified", async (req, res) => {
  try {
    const sightings = await loadSightings();
    res.json(sightings.filter((s) => s.verified === true));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I created this route to generate a unique list of species
app.get("/api/sightings/species-list", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const speciesNames = sightings.map((s) => s.species);
    res.json([...new Set(speciesNames)]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I filtered sightings by forest habitat and returned the count
app.get("/api/sightings/habitat/forest", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const forestSightings = sightings.filter((s) => s.habitat === "forest");

    res.json({
      habitat: "forest",
      sightings: forestSightings,
      count: forestSightings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I searched for an eagle sighting using a case-insensitive match
app.get("/api/sightings/search/eagle", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const found = sightings.find((s) =>
      String(s.species).toLowerCase().includes("eagle")
    );

    if (!found) {
      return res.status(404).json({
        message: "No eagle sighting found.",
      });
    }

    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I used this route to find the index position of a Moose sighting
app.get("/api/sightings/find-index/moose", async (req, res) => {
  try {
    const sightings = await loadSightings();
    const idx = sightings.findIndex((s) => s.species === "Moose");

    if (idx === -1) {
      return res.status(404).json({
        index: -1,
        message: "Moose not found.",
      });
    }

    res.json({
      index: idx,
      sighting: sightings[idx],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I sorted the sightings by date and returned the 3 most recent ones
app.get("/api/sightings/recent", async (req, res) => {
  try {
    const sightings = await loadSightings();

    const sorted = [...sightings].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const top3 = sorted.slice(0, 3).map((s) => ({
      id: s.id,
      species: s.species,
      location: s.location,
      habitat: s.habitat,
      date: s.date,
      verified: s.verified,
    }));

    res.json(top3);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I added this to handle invalid routes and make debugging easier
app.use((req, res) => {
  res.status(404).send("Route not found.");
});

// I exported the app so it works properly with Vercel
module.exports = app;

// I only start the server locally; Vercel handles it in production
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}/`);
  });
}
