// This is called with the results from from FB.getLoginStatus().
var accessToken = '';
function statusChangeCallback(response) {
  //console.log('statusChangeCallback');
  //console.log(response);
  if (response.authResponse) { 
    accessToken = FB.getAuthResponse()['accessToken']; 
  }
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    FB.api('/me', {fields:'id,name,about,email'}, function(response){
      var user = {
        email: response.email,
        displayName: response.name,
        description: response.about,
        id_token: accessToken,
        password:{enabled:false}
      };
      $.ajax({
        type: "POST",
        url: "/api/login",
        data: {json: JSON.stringify(user)},
        success: function(data){
          FB.api('/me/friendlists', function(response){
            window.location.href = "/users";
            console.log(response);
          });
        },
        error: function(jqxhr, textStatus, errorThrown){
          alert(errorThrown);
        }
      });
    });
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}


