// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {


  app.get("/api/meds", function(req, res) {
    var query = {};
    if (req.query.user_id) {
      query.UserId = req.query.user_id;
    }
    db.Meds.findAll({
      where: query,
      include: [db.User]
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.get("/api/meds/:id", function(req, res) {
    db.Meds.findOne({
      where: {
        id: req.params.id
      },
      include: [db.User]
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.post("/api/meds", function(req, res) {
    console.log("req.body.innerMed: " + JSON.stringify(req.body));
    db.Meds.create(req.body.innerMed).then(function(result) {
      var newMedID = result.id;
      console.log("newMedID: " + newMedID);
      for(var i = 0; i < req.body.events.length; i++){
        req.body.events[i].MedId = newMedID;
      }
      db.Events.bulkCreate(req.body.events).then(function(dbEvents){
        res.json(dbEvents);
      });
    });
  });


  app.delete("/api/meds/:id", function(req, res) {
    db.Meds.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.put("/api/meds", function(req, res) {
    console.log("req.body: " + JSON.stringify(req.body));
    db.Events.destroy({
      where: {
        MedId: req.body.id
      }
    }).then(function(result){
      db.Meds.update(
        req.body.innerMed,
        {
          where: {
            id: req.body.id
          }
        }).then(function(result) {
          console.log("result ID: " + result.id);
          //console.log("newMedID: " + newMedID);
          for(var i = 0; i < req.body.events.length; i++){
            req.body.events[i].MedId = req.body.id;
          }
          db.Events.bulkCreate(req.body.events).then(function(dbEvents){
            res.json(dbEvents);
          });
        });
    });
  });

};