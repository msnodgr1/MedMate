//$(document).ready(function() {
  /* global moment */

  // medsContainer holds all of our meds
  var medsContainer = $(".meds-container");

  // Click events for the edit and delete buttons
  $(document).on("click", "button.pic", obtainMedPics);
  $(document).on("click", "button.taken", handlePillTaken);
  $(document).on("click", "button.chart", obtainMedChart);
  $(document).on("click", "#emailBtn", sendEmail);

  // Variable to hold our meds
  var meds;
  //The code below handles the case where we want to get meds meds for a specific user
  // Looks for a query param in the url for user_id

  var url = window.location.search;
  var userId;

  if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getMeds(userId);
  }

  function sendEmail(){
    event.preventDefault();
    var emailAddress = $("#email_input").val().trim();
    var form = document.getElementById("emailForm");
    form.reset();
      $.get("api/events/send/" + emailAddress+"$"+userId, function(response){
        if(response == "sent"){
          alert("Email has been sent to "+ emailAddress +" Please check inbox!");
        }
    });
  }

  $(document).on("click", "#dashBtn", goToDashboard);
  $(document).on("click", "#newMedBtn", goToNewMed);
  $(document).on("click", "#medListBtn", goToMedList);
  $(document).on("click", "#pharmBtn", goToPharm);

  function goToPharm(){
    var location = $("#location").val().trim();
    $("#location").val("");
    window.open("https://www.google.com/maps/search/?api=1&query=pharmacy+" + location);
  }

  function goToDashboard(){
    window.location.href='/dashboard?user_id=' + userId; 
  }

  function goToNewMed(){
    window.location.href='/med-manager?user_id=' + userId; 
  }

  function goToMedList(){
    window.location.href='/med-list?user_id=' + userId; 
  }

  // This function grabs events from the database and updates the view
  function getMeds(user) {
    userId = user || "";
    $.get("/api/events/" + userId , function(data) {
      meds = data;
      var dateTime = new Date();
      var date = (dateTime.getMonth()+1) + '-' + dateTime.getDate() + '-' + dateTime.getFullYear();
      if (!meds || !meds.length) {
        displayEmpty(date);
      }
      else {
        initializeRows();
      }
    });
  }


  function takeMeds(currentMed) {
    $.ajax({
      method: "PUT",
      url: "/api/events/" + currentMed.id,
      data: currentMed
    })
    .done(function() {
      getMeds(userId);
    });
  }

  // InitializeRows handles appending all of our constructed meds HTML inside medsContainer
  function initializeRows() {
    medsContainer.empty();
    var medsToAdd = [];
    for (var i = 0; i < meds.length; i++) {
      medsToAdd.push(createNewRow(meds[i]));
    }
    medsContainer.append(medsToAdd);
  }

  // This function constructs a meds's HTML
  function createNewRow(meds) {

    var newMedsPanel = $("<div>");
    newMedsPanel.addClass("card");
    var newMedsWrapper = $("<div>");
    newMedsWrapper.addClass("card-body");
    var newMedsPanelHeading = $("<div>");
    newMedsPanelHeading.addClass("card-title");
    var picBtn = $("<button>");
    picBtn.text("View Picture(s)");
    picBtn.addClass("pic btn btn-outline-secondary");
    var takenBtn = $("<button>");
    takenBtn.text("Confirm Pill Taken");
    takenBtn.addClass("taken btn btn-outline-secondary");
    var chartBtn = $("<button>");
    chartBtn.text("View Chart");
    chartBtn.addClass("chart btn btn-outline-secondary");
    var newMedsTitle = $("<h2>");
    var newMedsDate = $("<small>");
    var newMedsUser = $("<h5>");
    newMedsUser.text("Med time: " + moment(meds.event_time).add(5, 'hours').format('MMMM Do YYYY, h:mm:ss a'));
    newMedsUser.css({
      float: "right",
      color: "red",
      "margin-top":
      "-10px"
    });
    var newMedsPanelBody = $("<div>");
    newMedsPanelBody.addClass("card-text");
    var newMedsBody = $("<p>");
    newMedsTitle.text(meds.Med.med_name + "  -  " + meds.Med.med_dose);
    newMedsBody.text(meds.Med.instructions + " - " + meds.Med.freq_times + " times  -  " + meds.Med.freq_main);
    newMedsPanelBody.append(newMedsBody);
    newMedsPanelBody.append(picBtn);
    newMedsPanelBody.append(chartBtn);
    if(meds.taken_status == false){
      newMedsPanelBody.append(takenBtn);
    }
    else if(meds.taken_status == true){
      newMedsPanelBody.append("<h3>Pill already taken</h3>");
    }
    newMedsPanelHeading.append(newMedsTitle);
    newMedsPanelHeading.append(newMedsUser);
    
    newMedsWrapper.append(newMedsPanelHeading);
    newMedsWrapper.append(newMedsPanelBody);
    newMedsWrapper.data("meds", meds);
    newMedsPanel.append(newMedsWrapper);
    //newMedsPanel.data("meds", meds);
    return newMedsPanel;
  }


  function handlePillTaken() {
    var currentMeds = $(this)
      .parent()
      .parent()
      .data("meds");
    takeMeds(currentMeds);
  }

  // This function displays a messgae when there are no meds
  function displayEmpty(date) {
    var query = window.location.search;
    var partial = "";
    if (date) {
      partial = " for date of:  " + date;
    }
    medsContainer.empty();
    var messageh2 = $("<h2>");
    messageh2.css({ "text-align": "center", "margin-top": "50px" });
    messageh2.html("No meds scheduled" + partial + ", navigate <a href='/med-list" + query +
    "'>here</a> in order to view all medications.");
    medsContainer.append(messageh2);
  }

  function obtainMedChart(){
    $("#chartBody").empty();
    event.preventDefault();
    var newChartCanvas = $("<canvas id='myChart'>");
    newChartCanvas.width("200px");
    newChartCanvas.height("200px");
    $("#chartBody").append(newChartCanvas);
    var chosenMed = $(this)
      .parent()
      .parent()
      .data("meds");
    var medName = chosenMed.Med.med_name.trim();
    var doseRemain = chosenMed.Med.remaining_count;
    var doseInitial = chosenMed.Med.initial_count;
    $("#chartModal").modal("toggle");
      var ctx = document.getElementById("myChart").getContext('2d');
      var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ["Doses Taken", "Doses Remaining"],
            datasets: [{
                label: 'meds taken',
                data: [doseInitial-doseRemain, doseRemain],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            cutoutPercentage: 50,
            title: {
              display: true,
              fontSize: 30,
              text: medName
            }
        }

      });
  }


  function obtainMedPics() {
    event.preventDefault();
    $(".slideshow-container").empty();
    $(".inner-container").empty();
    var chosenMed = $(this)
      .parent()
      .parent()
      .data("meds");
    var medNameFirst = chosenMed.Med.med_name;
    if(medNameFirst.includes("/") === true){
      medNameFirst = chosenMed.Med.med_name.substr(0,chosenMed.Med.med_name.indexOf('/'));
    }
    if (medNameFirst.includes("(") === true){
      medNameFirst = chosenMed.Med.med_name.substr(0,chosenMed.Med.med_name.indexOf('('));
    }
    var medName = medNameFirst.trim();
    var medDose = chosenMed.Med.med_dose.trim();
    var medDoseNum = medDose.match(/\d+/)[0].trim();
    var medDoseUnitFirst = (medDose.replace("Tab",'')).trim();
    var medDoseUnit = (medDoseUnitFirst.replace(/[0-9]/g,'')).toUpperCase().trim();
    var medDoseUnit2 = (medDoseUnit.replace(/-/g,"")).trim();
    var medDoseUnit3 = (medDoseUnit2.substr(0,medDoseUnit2.indexOf(' ')));
    var medDoseNew = " " + medDoseNum.trim() + " " + medDoseUnit3.trim();

    var queryURL = "https://rximage.nlm.nih.gov/api/rximage/1/rxnav?&resolution=600&rLimit=50&name="+ medName;
    //Use ajax call to obtain images asychronously
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response){
        var likelyArray = [];
        if(typeof response.nlmRxImages == 'undefined' || response.nlmRxImages.length == 0){
          $("#noPicModal").modal("toggle");
          return;
        }
        for(var i = 0; i<response.nlmRxImages.length; i++){
          if( (response.nlmRxImages[i].name).indexOf(medDoseNew) !== -1){
            likelyArray.push(response.nlmRxImages[i].imageUrl);
          }
        }
        if(typeof likelyArray == 'undefined' || likelyArray.length == 0){
          for(var j = 0; j<response.nlmRxImages.length; j++){
            likelyArray.push(response.nlmRxImages[j].imageUrl);
          }
        }
        var carouselContainer = $(".slideshow-container");
        var item = $(".inner-container");
        $("#picModal").modal("toggle");

        $.each(likelyArray, function( intIndex, objValue ){
          item.append($( '<span class = "dot" onclick="currentSlide(' + intIndex + ')"></span>' ));
          carouselContainer.append($('<div class="mySlides"><img src="' + objValue +'"style=width:100%></div>'));      
        });
          $('.carousel-indicators li:first').addClass('active');
          $('.carousel-inner li:first').addClass('active');

      var slideIndex = 1;
      showSlides(slideIndex);
      currentSlide(slideIndex);

    });
  }

  var slideIndex = 1;
  showSlides(slideIndex);

  // Next/previous controls
  function plusSlides(n) {
    showSlides(slideIndex += n);
  };

  // Thumbnail image controls
  function currentSlide(n) {
    showSlides(slideIndex = n);
  };

  function showSlides(n) {
    var i;
    var slides = $(".mySlides");
    var dots = $(".dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none"; 
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    if(n == 1){
      slides[0].style.display = "block";
      dots[0].className += " active";
    };
    if(n != 1){
      slides[slideIndex-1].style.display = "block"; 
      dots[slideIndex-1].className += " active";
    }
  };

//});
  

