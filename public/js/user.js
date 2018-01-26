$(document).ready(function() {
  // Getting references to the name input and User container, as well as the table body
  var nameInput = $("#user-name");
  var loginInput = $("#login-name");
  var emailInput = $("#email");
  var passwordInput = $("#password");
  var userList = $("tbody");
  var userContainer = $(".user-container");
  // Adding event listeners to the form to create a new object, and the button to delete
  // a User
  $(document).on("submit", "#user-form", handleUserFormSubmit);


  // A function to handle what happens when the form is submitted to create a new User
  function handleUserFormSubmit(event) {
    event.preventDefault();
    // Don't do anything if the name fields hasn't been filled out
    if (!nameInput.val().trim().trim() || !loginInput.val().trim().trim() || !emailInput.val().trim().trim() || !passwordInput.val().trim().trim()) {
      return;
    }
    // Calling the upsertUser function and passing in the value of the name input
    var userData = {
      name: nameInput
        .val()
        .trim(),
      username: loginInput
        .val()
        .trim(),
      email: emailInput
        .val()
        .trim(),
      password: passwordInput
        .val()
        .trim(),
      };

    upsertUser(userData);
  }

  // A function for creating a user. Calls getUsers upon completion
  function upsertUser(userData) {
    console.log(userData);
    $.post("/api/users", userData, function(response){
      console.log(response);
      if(response.errors){
        console.log("Thar be errors here");
        $("#usernameModal").modal("toggle");
        //alert("I'm sorry, that username is already in use. Please choose another.")
        //window.location.href='/users';
      }
      if(!response.errors){
        console.log("success");
        window.location.href='/today?user_id=' + response.id; 
      }
    });
  }

  //Code for the usernameModal modal
  function usernameModal(){
    window.location.href = "/users";
  };

  $(document).on("click", "#usermodBtn", usernameModal);


});
