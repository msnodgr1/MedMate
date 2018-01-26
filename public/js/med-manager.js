$(document).ready(function() {
  // Getting jQuery references to the meds body, title, form, and user select
  var nameInput = $("#name");
  var doseInput = $("#dose");
  var frequencyInput = $("#frequency");
  var timesInput = $("#times");
  var startInput = $("#start");
  var instructionsInput = $("#instructions");
  var countInput = $("#count");
  var remainingInput = $("#count");
  var strengths;
  var initialMedName = null;
  var initialMedDose = null;
  // Adding an event listener for when the form is submitted
  var medManagerForm = $("#med-manager");
  //var userSelect = $("#user");
  $(medManagerForm).on("submit", handleFormSubmit);

  //establish min date for datepicker
  var minDate = new Date();
  var currentMonth = minDate.getMonth()+1;
  currentMonth = currentMonth > 9 ? currentMonth : ("0" + currentMonth);  
  startInput[0].min = minDate.getFullYear() + '-' + currentMonth + '-' + minDate.getDate();

  var dateControl = document.querySelector('input[type="date"]');
  dateControl.value = minDate.getFullYear() + '-' + currentMonth + '-' + minDate.getDate();

  //set up lhc autocomplete
  new Def.Autocompleter.Prefetch('dose', []);
  new Def.Autocompleter.Search('name',
   'https://clin-table-search.lhc.nlm.nih.gov/api/rxterms/v3/search?maxList=25&ef=STRENGTHS_AND_FORMS');
  Def.Autocompleter.Event.observeListSelections('name', function() {
    var drugField = $('#name')[0];
    var drugFieldVal = drugField.value;
    var autocomp = drugField.autocomp;
    strengths = autocomp.getItemExtraData(drugFieldVal)['STRENGTHS_AND_FORMS'];
    if (strengths)
      $('#dose')[0].autocomp.setListAndField(strengths, '');
  });

  // Gets the part of the url that comes after the "?" (which we have if we're updating a meds)
  var url = window.location.search;
  var medsId;
  var userId;

  // Sets a flag for whether or not we're updating a meds to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the meds id from the url
  // In '?meds_id=1', medsId is 1
  if (url.indexOf("?meds_id=") !== -1) {
    medsId = url.split("=")[1];
    getMedsData(medsId, "meds");
  }
  // Otherwise if we have an user_id in our url, preset the user select box to be our user
  else if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
  }

  $(document).on("click", "#dashBtn", goToDashboard);
  $(document).on("click", "#medListBtn", goToMedList);
  $(document).on("click", "#todayBtn", goToToday);
  $(document).on("click", "#pharmBtn", goToPharm);

  function goToPharm(){
    var location = $("#location").val().trim();
    $("#location").val("");
    window.open("https://www.google.com/maps/search/?api=1&query=pharmacy+" + location);
  }

  function goToDashboard(){
    window.location.href='/dashboard?user_id=' + userId; 
  }

  function goToMedList(){
    window.location.href='/med-list?user_id=' + userId; 
  }

  function goToToday(){
    window.location.href='/today?user_id=' + userId; 
  }

  // Getting the users, and their meds
  getUsers();

  // A function for handling what happens when the form to create a new meds is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    
    resetFormValidation();
    var formValidationResult = validateForm();

    if(!formValidationResult.isFormValid){
      showValidationErrors(formValidationResult);
    }else{
      submitForm();
    }   
  }

  function submitForm(){

    // Constructing a newmeds object to hand to the database
    var startNew = new Date(startInput.val().trim());
    var startDate = startNew.getFullYear() + '-' + (startNew.getMonth()+1) + '-' + startNew.getDate();
    var startDateTime = startDate + " 03:00:00";
    var hourInterval;

    if(frequencyInput.val().trim().toUpperCase() == 'DAILY'){
      hourInterval = (24/timesInput.val().trim());
    }
    if(frequencyInput.val().trim().toUpperCase()  == 'WEEKLY'){
      hourInterval = (168/timesInput.val().trim());
    }
    if(frequencyInput.val().trim().toUpperCase()  == 'MONTHLY'){
      hourInterval = (720/timesInput.val().trim());
    }
    
    var newHrInterval = hrTohhmmss(hourInterval);
    var mStart = moment(startDateTime,"YYYY-MM-DD HH:mm:ss");
    var nextDateTime = moment(mStart._d).add(hourInterval, 'hours');
    var eventArray = [];

    for (var i = 0; i < countInput.val().trim(); i++){
      var med_count_number = (i+1);
      var event_time = (moment(mStart._d).add((hourInterval*i), 'hours'))._d;
      var MedId = "tempID";
      var eventItem = {med_count_number, event_time, MedId};
      eventArray.push(eventItem);
    }

    var newMed = {
      id: "",
      innerMed: {
      med_name: nameInput.val().trim(),
      med_dose: doseInput.val().trim(),
      freq_main: frequencyInput.val().trim(),
      freq_times: timesInput.val().trim(),
      hr_interval: newHrInterval,
      start_date: startInput.val().trim(),
      first_med: mStart._d,
      next_med: nextDateTime._d,
      instructions: instructionsInput.val().trim(),
      initial_count: countInput.val().trim(),
      remaining_count: countInput.val().trim(),
      UserId: userId
    },
      events: eventArray
    };

    // If we're updating a meds run updatemeds to update a meds
    // Otherwise run submitmeds to create a whole new meds
    if (updating) {
      newMed.id = medsId;
      updateMeds(newMed);
    }
    else {
      submitMeds(newMed);
    }
  }

  function hrTohhmmss(hrs){
     var sign = hrs < 0 ? "-" : "";
     var hr = Math.floor(Math.abs(hrs));
     var min = Math.floor((Math.abs(hrs) * 60) % 60);
     var sec = "00";
     return sign + (hr < 10? "0": "") + hr + ":" + (min < 10 ? "0" : "") + min + ":" + sec;
  }

  // Submits a new meds and brings client to med page upon completion
  function submitMeds(meds) {
    $.post("/api/meds", meds, function() {
      window.location.href = "/med-list?user_id=" + userId;
    });
  }

  // Gets meds data for the current meds if we're editing, or if we're adding to an users existing meds
  function getMedsData(id, type) {
    var queryUrl;
    switch (type) {
      case "meds":
        queryUrl = "/api/meds/" + id;
        break;
      case "user":
        queryUrl = "/api/users/" + id;
        break;
      default:
        return;
    }
    $.get(queryUrl, function(data) {
      if (data) {
        var startNew = new Date(data.start_date);
        var startDate =  ("0" + (startNew.getMonth()+1)).slice(-2) + '/' + ("0" + startNew.getDate()).slice(-2) + '/' + startNew.getFullYear();
        // If this meds exists, prefill our med-manager forms with its data
        nameInput.val(data.med_name);  
        doseInput.val(data.med_dose);  
        frequencyInput.val(data.freq_main); 
        timesInput.val(data.freq_times);

        // set initial values for name and dose for editting med submissions without using autocomp
        initialMedName = data.med_name;
        initialMedDose = data.med_dose;

        //establish min date for datepicker
        var minDate = new Date(startDate);
        var currentMonth = minDate.getMonth()+1;
        currentMonth = currentMonth > 9 ? currentMonth : ("0" + currentMonth);  
        startInput[0].min = minDate.getFullYear() + '-' + currentMonth + '-' + minDate.getDate();

        var dateControl = document.querySelector('input[type="date"]');
        dateControl.value = minDate.getFullYear() + '-' + currentMonth + '-' + minDate.getDate();

        //startInput.val(startDate); 
        instructionsInput.val(data.instructions); 
        countInput.val(data.initial_count);
        userId = data.UserId || data.id;
        // If we have a meds with this id, set a flag for us to know to update the meds
        // when we hit submit
        updating = true;
      }
    });
  }

  
  // A function to get users and then render our list of users
  function getUsers() {
    $.get("/api/users", renderUserList);
  }
  // Function to either render a list of users, or if there are none, direct the client to the page
  // to create a user first
  
  function renderUserList(data) {
    if (!data.length) {
      window.location.href = "/users";
    }
    $(".hidden").removeClass("hidden");
  }

  // Update a given meds, bring user to the blog page when done
  function updateMeds(meds) {
    $.ajax({
      method: "PUT",
      url: "/api/meds",
      data: meds
    })
    .done(function() {
      window.location.href = "/med-list?user_id=" + userId;
    });
  }

// Validation 

  // validator is comprised of functions dedicated to validating form inputs
  var validator = {

    validateMed: function(medInput){
      var validationResult = { isValid: true, message:""};
      if(!medInput.val().trim()){
        validationResult.isValid = false;
        validationResult.message = "You must enter a med.";
      }
      if(validationResult.isValid
         && !isStableEdit(doseInput.val().trim(), medInput.val().trim()) 
         && medInput[0].autocomp.getItemCode(medInput[0].autocomp.getSelectedItems()[0]) == null){
        validationResult.isValid = false;
        validationResult.message = "You must enter a valid med.";        
      }
      return validationResult;
    },

    validateDose:function(doseInput, medInput){
      var validationResult = { isValid: true, message:""};
      if(!doseInput.val().trim()){
        validationResult.isValid = false;
        validationResult.message = "Please enter a dosage.";
      }
      if(validationResult.isValid 
          && !isStableEdit(doseInput.val().trim(), medInput.val().trim()) 
          && !(strengths.indexOf(doseInput.val()) > -1)){
        validationResult.isValid = false;
        validationResult.message = "Please enter a valid dosage.";  
      }
      return validationResult;
    },

    validateFrequency:function(frequencyInput){
      var validationResult = { isValid: true, message:""};
      if(!frequencyInput.val().trim()){
        validationResult.isValid = false;
        validationResult.message = "Please enter a frequency.";
      } 
      return validationResult;
    },

    validateTimes:function(timesInput){
      var validationResult = { isValid: true, message:""};
      if(!timesInput.val().trim()){
        validationResult.isValid = false;
        validationResult.message = "Please enter a time.";
      }
      if(validationResult.isValid && !Number.isInteger(parseInt(timesInput.val().trim()))){
        validationResult.isValid = false;
        validationResult.message = "Please enter a valid number.";
      }
      return validationResult;
    },

    validateStart:function(startInput){
      var validationResult = { isValid: true, message:""};

      return validationResult;
    },

    validateCount:function(countInput){
      var validationResult = { isValid: true, message:""};
      if(!countInput.val().trim()){
        validationResult.isValid = false;
        validationResult.message = "Please enter a med count.";
      }
      if(validationResult.isValid && !Number.isInteger(parseInt(countInput.val().trim()))){
        validationResult.isValid = false;
        validationResult.message = "Please enter a valid number.";
      }
      return validationResult;
    }

  }

  function validateForm(){
    var validationFormResult = {};
    validationFormResult.medInputResult = validator.validateMed(nameInput);
    validationFormResult.doseInputResult = validator.validateDose(doseInput, nameInput);
    validationFormResult.frequencyInputResult = validator.validateFrequency(frequencyInput);
    validationFormResult.timesInputResult = validator.validateTimes(timesInput);
    validationFormResult.startInputResult = validator.validateStart(startInput);
    validationFormResult.countInputResult = validator.validateCount(countInput);
    validationFormResult.isFormValid = isFormValid(validationFormResult);
    return validationFormResult;
  }

  function isFormValid(validationFormResult){
    var formIsValid = 
      (validationFormResult.medInputResult.isValid 
        && validationFormResult.doseInputResult.isValid
        && validationFormResult.frequencyInputResult.isValid 
        && validationFormResult.timesInputResult.isValid 
        && validationFormResult.startInputResult.isValid 
        && validationFormResult.countInputResult.isValid);
    return formIsValid;
  }

  // clears out all the error messages currently visibile on the form
  function resetFormValidation(){
    $("#nameInputValidation").hide();
    $("#doseInputValidation").hide();
    $("#frequencyInputValidation").hide();
    $("#timesInputValidation").hide();
    $("#startInputValidation").hide();
    $("#countInputValidation").hide();
  }

  function isStableEdit(currentMedDoseValue, currentMedNameValue){
    if(initialMedDose == currentMedDoseValue && initialMedName === currentMedNameValue){ 
      return true;
    }
    return false;
  }

  // will update the validation messages and show the correct ones
  function showValidationErrors(validationFormResult){
    if(!validationFormResult.medInputResult.isValid){
      $("#nameInputValidation").text(validationFormResult.medInputResult.message); 
      $("#nameInputValidation").show();     
    }
    if(!validationFormResult.doseInputResult.isValid){
      $("#doseInputValidation").text(validationFormResult.doseInputResult.message);  
      $("#doseInputValidation").show();       
    }
    if(!validationFormResult.frequencyInputResult.isValid){
      $("#frequencyInputValidation").text(validationFormResult.frequencyInputResult.message);    
      $("#frequencyInputValidation").show();
    }
    if(!validationFormResult.timesInputResult.isValid){
      $("#timesInputValidation").text(validationFormResult.timesInputResult.message);
      $("#timesInputValidation").show();   
    }
    if(! validationFormResult.startInputResult.isValid){
      $("#startInputValidation").text(validationFormResult.startInputResult.message);
      $("#startInputValidation").show();   
    }
    if(!validationFormResult.countInputResult.isValid){
      $("#countInputValidation").text(validationFormResult.countInputResult.message);
      $("#countInputValidation").show();
    }
  }
});