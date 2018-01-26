// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var nodemailer = require("nodemailer");
var schedule = require("node-schedule");
// Routes
// =============================================================
module.exports = function(app) {

  var j = schedule.scheduleJob('*/2 * * * *', function(){
    getAllEvents();
  });


  var date = new Date();
  var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
  newDate = newDate + " 08:00:00";
  console.log("newDate: " + newDate);

  var nextdate = new Date();
  nextdate.setDate(nextdate.getDate()+1);
  var nextnewDate = nextdate.getFullYear() + '-' + (nextdate.getMonth()+1) + '-' + nextdate.getDate();
  nextnewDate = nextnewDate + " 07:59:59";
  console.log("nextnewDate: " + nextnewDate);


  app.get("/api/events/:id", function(req, res) {
    var query = {
      event_time: {
        [Op.between]: [newDate, nextnewDate]
      }
    }
    db.Events.findAll({
      where: query,
      include: [
        {
          model: db.Meds,
          where: {UserId: req.params.id},
          include: [
            {
              model: db.User
            }
          ]
        }
      ],
      order: ['event_time']
    }).then(function(dbEvents) {
      res.json(dbEvents);
    });
  });



  function getAllEvents(){

        var date = new Date();
        var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
        newDate = newDate + " 08:00:00";
        console.log("FUNCTION newDate: " + newDate);

        var nextdate = new Date();
        nextdate.setDate(nextdate.getDate()+1);
        var nextnewDate = nextdate.getFullYear() + '-' + (nextdate.getMonth()+1) + '-' + nextdate.getDate();
        nextnewDate = nextnewDate + " 07:59:59";
        console.log("FUNCTION nextnewDate: " + nextnewDate);

        console.log("I HIT THE APP.GET");
        var query = {
          event_time: {
            [Op.between]: [newDate, nextnewDate]
          }
        }
        db.Events.findAll({
          where: query,
          include: [
            {
              model: db.Meds,
              include: [
                {
                  model: db.User
                }
              ]
            }
          ],
          order: ['event_time']
        }).then(function(dbEvents) {
          
          var emailAddress = "";
          var emailAddressArray = [];

          if (typeof dbEvents == 'undefined' || dbEvents.length == 0){
            return;
          }

          else{
          	for(var j=0; j < dbEvents.length; j++){
          		if(emailAddressArray.indexOf(dbEvents[j].Med.User.email) == -1){
          			emailAddressArray.push(dbEvents[j].Med.User.email);
          		}
          	}
          }
          console.log("EMAIL ADDRESS ARRAY: " + emailAddressArray);

          var emailEventsArray = [];

          for(var v=0; v < emailAddressArray.length; v++){
	          	var tempArray = [];
	          	var currentEmail = emailAddressArray[v];

	          	for (var k=0; k < dbEvents.length; k++){
	          		if(dbEvents[k].Med.User.email === currentEmail){
	          			tempArray.push(dbEvents[k]);
	          		}
	          	}

	            var eventsText = "";

	            for(var i=0; i<tempArray.length; i++){
	            	var yesno = "YES";
	            	console.log("Taken STATUS: " + tempArray[i].taken_status);
					if(tempArray[i].taken_status === false ) {
					    yesno = "NO";
					}
	            	var dateTime = getFormattedDateTime(tempArray[i].event_time);
	            	var eventItem = ("<p>Name:   <b>" + tempArray[i].Med.med_name + "</b>   Take Time:   <b>" + dateTime + "</b>   Taken Already?:   <b>"  +  yesno + "</b></p>");
	            	eventsText = eventsText + eventItem;
	            }
	            var name = tempArray[0].Med.User.name;
	            sendEmails(name, currentEmail, eventsText);
  	
          }

          function sendEmails(name, email, emailData){

	          var transporter = nodemailer.createTransport({
	            host: 'smtp.gmail.com',
	            port: 587,
	            auth: {
	                user: 'med.mate.medreminders@gmail.com',
	                pass: 'passwurd'
	            }
	          });

	          //set up email to send, to , from, subject, text
	          var mailOptions = {
	            from: 'med.mate.medreminders@gmail.com',
	            to: email,
	            subject: "Medications to take today",
	            text: "Medications to take today",
	            html: "<p><b>HELLO " + name + "! THE FOLLOWING MEDICATIONS ARE TO BE TAKEN TODAY </b></p>"  + emailData
	          };

	          //send email, log error if any, return "sent" if no error
	          transporter.sendMail(mailOptions, (error, info) => {
	              if (error) {
	                  return console.log(error);
	              }
	          });
	      }

        });
  };




  app.put("/api/events/:id", function(req, res) {
    console.log("req.body: " + JSON.stringify(req.body));
    db.Events.update(
      {taken_status: true},
      {
        where: {
          id: req.params.id
        }
      }).then(function(result) {
        db.Meds.update(
          {remaining_count: Sequelize.literal('remaining_count - 1')},
          {
            where: {
              id: req.body.Med.id
            }
          }).then(function(dbEvents){
            res.json(dbEvents);
          });
      });
  });



  //email route for testing
  app.get("/api/events/send/:email", function(req,res){
    //set email address as entered email
    var parts = (req.params.email).split("$",2);
    var emailAddress = parts[0];
    var userId = parts[1];
    console.log("emailAddress and UserId: " + emailAddress + " " + userId);
    var query = {
      event_time: {
        [Op.between]: [newDate, nextnewDate]
      }
    }
    db.Events.findAll({
      where: query,
      include: [
        {
          model: db.Meds,
          where: {
          	UserId: userId
          },
          include: [
            {
              model: db.User
            }
          ]
        }
      ],
      order: ['event_time']
    }).then(function(dbEvents) {
      var eventsObj = {
        eventsDB: dbEvents
      };

      console.log("DB EVENTS: " + JSON.stringify(dbEvents));
      if (typeof eventsObj.eventsDB == 'undefined' || eventsObj.eventsDB.length == 0){
        return;
      }

      //set up node mailer default sender
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'med.mate.medreminders@gmail.com',
            pass: 'passwurd'
        }
      });

      var eventsText = "";

      //loop through events due and html-ify for email, adding to total text
      for(var i=0; i<eventsObj.eventsDB.length; i++){
	    var yesno = "YES";
    	console.log("Taken STATUS: " + eventsObj.eventsDB[i].taken_status);
		if(eventsObj.eventsDB[i].taken_status === false ) {
		    yesno = "NO";
		}
      	var dateTime = getFormattedDateTime(eventsObj.eventsDB[i].event_time);
        var eventItem = ("<p>Name:   <b>" + eventsObj.eventsDB[i].Med.med_name + "</b>   Take Time:   <b>" + dateTime +  "</b>   Taken Already?:   <b>"  + yesno + "</b></p>");
        eventsText = eventsText + eventItem;
      };

      var name = eventsObj.eventsDB[0].Med.User.name;
      //set up email to send, to , from, subject, text
      var mailOptions = {
        from: 'med.mate.medreminders@gmail.com',
        to: emailAddress,
        subject: "Medications to take today",
        text: "Medications to take today",
        html: "<p><b>HELLO " + name + "! THE FOLLOWING MEDICATIONS ARE TO BE TAKEN TODAY </b></p>"  + eventsText
      };

      //send email, log error if any, return "sent" if no error
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
      });
      res.send("sent");
    });
  });
  

  function getFormattedDateTime(data){
    var tempDate = data;
	var months = ["January","February","March","April","May","June","July","August","September","October","November", "December"];
	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var newTempDate = tempDate.getDate()  + " " + tempDate.getFullYear();
	var newDay = days[tempDate.getDay()];
	var newMonth = months[tempDate.getMonth()];
	var newDateString = newDay + " " + newMonth + " " + newTempDate;
	var hr = tempDate.getHours() + 5;
	var min = tempDate.getMinutes();
	if (min < 10) {
	    min = "0" + min;
	}
	var ampm = "AM";
	if( hr > 12 ) {
	    hr -= 12;
	    ampm = "PM";
	}
	var newTimeString = hr + ":" + min + " " + ampm;
	var newDateTimeString = newDateString + " at " + newTimeString;
	return newDateTimeString;
  }


};