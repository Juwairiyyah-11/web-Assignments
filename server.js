/********************************************************************************
* WEB322 – Assignment 02
* File: server.js
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Juwairiyyah Ahmed   Student ID: 173801234   Date: 12/11/2025
*
********************************************************************************/

const express = require("express");
const app = express();
const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

// setup for middleware and view engine
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Returns home page content
app.get('/', (req, res) => {
    res.render("home", { title: "Home", page:"/" });
});

// Returns about page content
app.get("/about", (req, res) => {
    res.render("about", {title: "About",page: "/about"});
});

// Returns all the projects from the module
app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;

    if (sector) {
        projectData.getProjectsBySector(sector)
            .then(projects => {
                res.render("projects", {
                    title: "Projects",
                    projects,
                    page: "/solutions/projects"
                });
            })
            .catch(err => {
                res.status(404).render("custom-404", {
                    title: "Not Found",
                    message: `No projects found for sector: ${sector}`,
                    page: ""
                });
            });

    } else {
        projectData.getAllProjects()
            .then(projects => {
                res.render("projects", {
                    title: "Projects",
                    projects,
                    page: "/solutions/projects"
                });
            })
            .catch(err => {
                res.status(404).render("custom-404", {
                    title: "Not Found",
                    message: "Unable to load project list.",
                    page: ""
                });
            });
    }
});

// Displays one project using the ID
app.get("/solutions/projects/:id", (req, res) => {
    const id = Number(req.params.id);

    projectData.getProjectById(id)
        .then(project => {
            res.render("project-single", {
                title: project.projectName,
                project,
                page: "/solutions/projects"
            });
        })
        .catch(err => {
            res.status(404).render("custom-404", {
                title: "Not Found",
                message: `No project found with ID: ${id}`,
                page: ""
            });
        });
});

  // A catch all route for any requests that don't match the specified ones
  // 404 error page
app.use((req, res) => {
    res.status(404).render("custom-404", {
        title: "Not Found",
        message: "Page not found.",
        page: ""
    });
});

//Initializes and starts the server
projectData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server running on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.log("Initialization failed:", err);
    });
// End of server.js