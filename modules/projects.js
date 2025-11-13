/********************************************************************************
* WEB322 – Assignment 02
* File: projects.js
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Juwairiyyah Ahmed   Student ID: 173801234   Date: 12/11/2025
*
********************************************************************************/
const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];
// initialize function that combines projectData with sector names
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = [];

            projectData.forEach(project => {
                const sectorMatch = sectorData.find(s => s.id === project.sector_id);
                projects.push({
                    ...project,
                    sector: sectorMatch ? sectorMatch.sector_name : "Unknown"
                });
            });

            resolve();
        } catch (err) {
            reject("Unable to initialize project data: " + err);
        }
    });
}

// Return all projects
function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) resolve(projects);
        else reject("No projects available.");
    });
}

// Return project by id
function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const found = projects.find(p => p.id === projectId);
        found ? resolve(found) : reject(`Project not found: ${projectId}`);
    });
}

// Filter projects by sector
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const query = sector.toLowerCase();
        const filtered = projects.filter(p => p.sector.toLowerCase().includes(query));
        filtered.length > 0
            ? resolve(filtered)
            : reject(`No projects found for sector: ${sector}`);
    });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector
};