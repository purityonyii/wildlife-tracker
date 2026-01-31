const fs = require("fs");
const path = require("path");

async function loadSightings() {
  try {
    const filePath = path.join(__dirname, "..", "data", "sightings.json");
    const dataString = await fs.promises.readFile(filePath, "utf-8");

    const dataObj = JSON.parse(dataString);

    // Accept BOTH formats:
    // 1) [ ... ]
    if (Array.isArray(dataObj)) {
      return dataObj;
    }

    // 2) { "sightings": [ ... ] }
    if (dataObj && Array.isArray(dataObj.sightings)) {
      return dataObj.sightings;
    }

    throw new Error("Invalid sightings.json format: expected an array or an object with 'sightings' array");
  } catch (err) {
    console.error("loadSightings error:", err);
    throw new Error("Unable to load sightings data. Please try again later.");
  }
}

module.exports = { loadSightings };
