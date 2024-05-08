  // Check if the user is logged in when the page loads
  window.onload = async function() {
    if (sessionStorage.getItem("loggedIn") ) {
      if(sessionStorage.getItem("index") == "-1" ){
        window.location.href = "/err"
        window.sessionStorage.clear()
      }else{
        window.location.href = `/${sessionStorage.getItem("index")}`
      }
    
  };


document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // prevent form submission
    
    // Get email and password from form
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    
    // Normally, you would verify the email and password with a backend server
    
      // Redirect to another page (e.g., dashboard)
     return await fetch("./verify2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email, password: password })
      })
      .then(response => response.json())
      .then(data => {
      // Handle the todo list data here
      //console.log(data)
      if(data == "-1"){
        window.location.href = `/err`
      }else{
        window.location.href = `/${data}`
        // Store login status in session storage
        sessionStorage.setItem("loggedIn", true);
        sessionStorage.setItem("index", data);
      
      }
   
      
      })
      .catch(error => console.error('Error fetching todo list:', error));
    
  });
}
