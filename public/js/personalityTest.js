$(document).ready(function(){
  var selectedTags = [];

  $('.selector-block').click(function(){
    if (selectedTags.indexOf($(this).text()) != -1){
      selectedTags.splice(selectedTags.indexOf($(this).text()),1);
      $(this).css("background-image",'none');
    }
    else{
      selectedTags.push($(this).text());
      $(this).css("background-image",'url(../img/check.png)');
      $(this).css("background-size","contain");
      $(this).css("background-repeat","no-repeat");
      $(this).css("background-position","center center");
    }
  });

  $('#checkResult').click(function(){
    var recommendation = {
      sender: -1,
      receiver: "anonymous",
      receiverTags: selectedTags,
      productID: [],
      productName: null,
      rating: -1,
      date: Date()
    };

    $.ajax({
      type: "POST",
      url: "/personalityTest/result",
      data: recommendation,
      success: function(data){
        window.location.href = "/searchAndShowproducts/" +  data._id;
      },
      error: function(){
        alert("Error in Finding a Recommendation");
      }
    });
    selectedTags = [];
  });
});