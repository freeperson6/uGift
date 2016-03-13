$(document).ready(function(){

	$('#searchFacebookButton').click(function(){
		var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
		var receiver = $('#searchFacebook').val();
		if (receiver != null){
			receiver = receiver.match(urlRegEx)[0];
			var recommendation = {
		      sender: -1,
		      receiver: receiver,
		      receiverTags: [],
		      productID: [],
		      productName: null,
		      rating: -1,
		      date: Date()
		    };

			$.ajax({
				type: "POST",
				url: "/facebookProfile",
				data: recommendation,
				success: function(data){
					console.log(data._id);
					window.location.href = "/searchAndShowproducts/" +  data._id;
				},
				error: function(){
					alert("Error in Finding a Recommendation");
				}
			});
		}
		else{
			alert("You must imput a valid Facebook Profile URL!");
		}
	});
/*--------------------------------------------------------------------
If click on one user row, go to the user's profile
---------------------------------------------------------------------*/
	$('.user-row').click(function(){
  		var id = $(this).data('id');
		window.location.href = "/users/"+id;
	});	

/*--------------------------------------------------------------------
Search user take in the keyword to searc
and return to the website of the searched resutl
---------------------------------------------------------------------*/
	$('#searchUser').click(function(){
		$.ajax({
			type: "GET",
			url: "/api/users/search/?keyword=" + $('#searchUserKeyword').val(),
			success: function(users){
				if(users.length>0){
					$('#userList').html(showUsers(users));
					$('.user-row').click(function(){
				  		var id = $(this).data('id');
				  		window.location.href = "/users/"+id;
					});	
				} else {
					$('#userList').html("<span>No user found. </span>");
				}
				
			},
			error: function(err){
				alert(err);
			}
		})
	});

	$('#personality').click(function(){
		window.location.href = "/personalityTest"
	});
});

/*----------------------------------------------------------------
Used to display htmls
-----------------------------------------------------------------*/
function showUsers(users){
	var html = "";
	for(i in users){
		html = html + "<tr class='user-row' data-id='"+users[i]._id+"''>";
		html = html + "<th>"+users[i].email+"</th>";
		html = html + "<th>"+users[i].displayName+"</th></tr>";	
	}
	return html;
}


//Helper function: Getting Lat Long Using Goolge API:
function updateTrip(provider,expectedDate){
	startAddress_plain = $("#fromWhere").val();
	endAddress_plain =  $("#toWhere").val();
	startAddress = ($("#fromWhere").val()).replace(/[ ,.\#]/g,"+");
	endAddress = ($("#toWhere").val()).replace(/[ ,.\#]/g,"+");
	var date = expectedDate;
	var latlng;
	var trip = {
		user: -1,
		startPoint: null,
		endPoint: null,
		date: date,
		price: $('#expectedPrice').val(),
		provider: provider,
		searchDistance: $('#searchDistance').val()
	};
	
	console.log(trip.searchDistance);
	$.ajax({
		type: "GET",
		url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + startAddress + "&key=AIzaSyC9XO6VWQkwsUbXQi7WObMU1ekQFsIoKqk&language=en",
		success: function(data){
			if (data.status == "ZERO_RESULTS"){
				alert("Incorrect Address Entered");
			}
			else {
				var lat = Number(data.results[0].geometry.location.lat);
				var lng = Number(data.results[0].geometry.location.lng);
				latlng = {latitude: lat, longitude: lng, text: data.results[0].formatted_address};
				trip.startPoint = latlng;
				$.ajax({
					type: "GET",
					url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + endAddress + "&key=AIzaSyC9XO6VWQkwsUbXQi7WObMU1ekQFsIoKqk&language=en",
					success: function(data){
						var lat = Number(data.results[0].geometry.location.lat);
						var lng = Number(data.results[0].geometry.location.lng);
						latlng = {latitude: lat, longitude: lng, text: data.results[0].formatted_address};
						trip.endPoint = latlng;
						$.ajax({
							type:"POST",
							url:"/api/updateTrip",
							data: trip,
							success: function(data){
								window.location.href ='/searchTrip/' + data;
							},
							error: function(){
								alert("Error in updateing Trip to the server");
							}
						});
					},
					error: function(){
						alert("Fail To Get Info about Address you have entered");
					}
				});
			}
		},
		error: function(){
			alert("Fail To Get Info about Address you have entered");
		}
	});
}