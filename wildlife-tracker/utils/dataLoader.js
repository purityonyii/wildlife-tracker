const fs = require("fs");
const path = require("path");

async function loadSightings() {
  try {
    const filePath = path.join(__dirname, "..", "data", "sightings.json");
    const dataString = await fs.promises.readFile(filePath, "utf-8");

    const dataObj = JSON.parse(dataString);

    // expects something like: { "sightings": [ ... ] }
    if (!dataObj || !Array.isArray(dataObj.sightings)) {
      throw new Error("Invalid sightings.json format: missing 'sightings' array");
    }

    return dataObj.sightings;
  } catch (err) {
    console.error("loadSightings error:", err);
    throw new Error("Unable to load sightings data. Please try again later.");
  }
}

module.exports = { loadSightings };
