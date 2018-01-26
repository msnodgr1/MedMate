// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");

// Routes
// =============================================================
module.exports = function(app) {

  // Each of the below routes just handles the HTML page that the user gets sent to.

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/med-list.html"));
  });

  app.get("/med-manager", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/med-manager.html"));
  });

  app.get("/med-list", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/med-list.html"));
  });

  app.get("/users", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/user-manager.html"));
  });

  app.get("/today", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/today.html"));
  });
};