/********************************************************************************
* WEB322 – Assignment 01
* File: projects.js
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Juwairiyyah Ahmed   Student ID: 173801234   Date: 02/10/2025
*
********************************************************************************/
const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

// initialize(): combines the projectData with the matching sector
function Initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = [];

            projectData.forEach((project) => {
                const matchingSector = sectorData.find(
                    (sector) => sector.id === project.sector_id
                );
                const completeProject = {
                    ...project,
                    sector: matchingSector ? matchingSector.sector_name : "Unknown",
                };
                projects.push(completeProject);
            });

            resolve();
        } catch (err) {
            reject("Unable to initialize project data: " + err);
        }
    });
}

// getAllProjects(): returns the complete array for projects
function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No project data available. Please initialize it first.");
        }
    });
}

// getProjectById(projectId): returns the one specified project
function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const foundPorject = projects.find((proj) => proj.id === projectId);
        if (foundProject) {
            resolve(foundProject);
        } else {
            reject('Unable to fins project with ID: ${projectId}');
        }
    });
}

//getProjectsBySector(sector): a filter for the projects that's not case sensitive
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const query = sector.toLowerCase();
        const filteredProjects = projects.filter((proj) =>
            proj.sector.toLowerCase().includes(query)
        );

        if (filteredProjects.length > 0) {
            resolve(filteredProjects);
        } else {
            reject('Unable to find projects for sector: ${sector}');
        }
    });
}

// Exports all the functions for external use
module.exports = {
    Initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
};

// For testing (optional)
if (require.main === module) {
    Initialize()
      .then(() => getAllProjects())
      .then((allProjects) => {
        console.log("Total Projects Loaded:", allProjects.length);

        return this.getProjectById(9);
      })
      .then((project) => {
        console.log("\n Project with ID 9:");
        console.log(project);

        return getProjectsBySector("agriculture");
      })
      .then((sectorProjects) => {
        console.log("\n Projects in Agriculture Sector:");
        console.log(sectorProjects.map((p) => p.title));
      })
      .catch((err) => {
        console.error("Error:", err);
      });
}