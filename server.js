/********************************************************************************
* WEB322 – Assignment 01
* File: server.js
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Juwairiyyah Ahmed   Student ID: 173801234   Date: 02/10/2025
*
********************************************************************************/

const express = require("express");
const app = express();
const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Assignment 1: Juwairiyyah Ahmed - 173801234");
});

// Returns all the projects from the module
app.get("/solutions/projects", (req, res) => {
    projectData.getAllProjects()
      .then(projects => {
        res.json(projects);
    })
      .catch(err => {
        res.status(500).json({ message: err});
    });
});

// the demo with a known ID
app.get("/solutions/projects/id-demo", (req, res) => {
    const demoId = 9;

    projectData
      .getProjectById(demoId)
      .then(project => {
        res.json(project);
    })
      .catch(err => {
        res.status(404).json({ message: err });
    });
});

// the demo using a partial string
app.get("/solutions/projects/sector-demo", (req, res) => {
    const demoSector = "agriculture";
    projectData
      .getProjectsBySector(demoSector)
      .then((sectorProjects) => {
        res.json(sectorProjects);
    })
      .catch((err) => {
        res.status(404).json({ message: err });
    });
});

// initializes the project data first, then allows server to start
projectData
  .Initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('Server is running on port: ${HTTP_PORT}');
        console.log("Visit http://localhost:8080/");
    });
  })
  .catch(err => {
    console.log("Failed to initialize the project data:", err);
  });