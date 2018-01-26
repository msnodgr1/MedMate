$(document).ready(function() {
  
  $(document).on("click", ".delete-user", handleDeleteButtonPress);

  var userList = $("tbody");
  var userContainer = $(".user-container");

  var url = window.location.search;
  
  var userId;

  // If we have this section in our url, we pull out the meds id from the url
  // In '?meds_id=1', medsId is 1
  if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getUsers(userId);
  }
  // Otherwise if we have an user_id in our url, preset the user select box to be our user
  else if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
  }

  $(document).on("click", "#medListBtn", goToMedList);
  $(document).on("click", "#newMedBtn", goToNewMed);
  $(document).on("click", "#todayBtn", goToToday);
  $(document).on("click", "#pharmBtn", goToPharm);

  function goToPharm(){
    var location = $("#location").val().trim();
    $("#location").val("");
    window.open("https://www.google.com/maps/search/?api=1&query=pharmacy+" + location);
  }

  function goToMedList(){
    window.location.href='/med-list?user_id=' + userId; 
  }

  function goToNewMed(){
    window.location.href='/med-manager?user_id=' + userId; 
  }

  function goToToday(){
    window.location.href='/today?user_id=' + userId; 
  }

  // Getting the intiial list of Users
  getUsers(userId);


  // Function for creating a new list row for users
  function createUserRow(userData) {
    var newTr = $("<tr>");
    newTr.data("user", userData);
    newTr.append("<td>" + userData.name + "</td>");
    newTr.append("<td> " + userData.username + "</td>");
    newTr.append("<td><a href='/med-list?user_id=" + userData.id + "'>Go to Meds</a></td>");
    newTr.append("<td><a href='/med-manager?user_id=" + userData.id + "'>Add a Med</a></td>");
    newTr.append("<td><a style='cursor:pointer;color:red' class='delete-user'>Delete Account</a></td>");
    return newTr;
  }

  // Function for retrieving users and getting them ready to be rendered to the page
  function getUsers(userId) {
    $.get("/api/users/" + userId, function(data){
      var rowsToAdd = createUserRow(data);
      renderUserList(rowsToAdd);
    });
  }

  // A function for rendering the list of users to the page
  function renderUserList(rows) {
    userList.children().not(":last").remove();
    userContainer.children(".alert").remove();
    if (rows.length) {
      userList.prepend(rows);
    }
    else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no users
  function renderEmpty() {
    var alertDiv = $("<div>");
    alertDiv.addClass("alert alert-danger");
    alertDiv.text("You must create an User before you can add Meds.");
    userContainer.append(alertDiv);
  }


  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    var listItemData = $(this).parent("td").parent("tr").data("user");
    var id = listItemData.id;
    $("#deleteAccount").modal("toggle");
    $("#delete").on("click", function(){
	      $.ajax({
	      method: "DELETE",
	      url: "/api/users/" + id
	    })
    	.done(function() {
    		window.location.href='/';
    	});
    });
  }
});
