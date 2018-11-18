// Initialize Firebase
var config = {
  apiKey: "your_key",
  authDomain: "auth_domain",
  databaseURL: "db",
  projectId: "project_id",
  storageBucket: "storage_bucket",
  messagingSenderId: "messaging_sender_id"
};
firebase.initializeApp(config);
var database = firebase.database();

//Setting up the landing page
$(document).ready(function() {
  scaleVideoContainer();

  initBannerVideoSize(".video-container .poster img");
  initBannerVideoSize(".video-container .filter");
  initBannerVideoSize(".video-container video");

  $(window).on("resize", function() {
    scaleVideoContainer();
    scaleBannerVideoSize(".video-container .poster img");
    scaleBannerVideoSize(".video-container .filter");
    scaleBannerVideoSize(".video-container video");
  });
});

function scaleVideoContainer() {
  var height = $(window).height() + 5;
  var unitHeight = parseInt(height) + "px";
  $(".homepage-hero-module").css("height", unitHeight);
}

function initBannerVideoSize(element) {
  $(element).each(function() {
    $(this).data("height", $(this).height());
    $(this).data("width", $(this).width());
  });

  scaleBannerVideoSize(element);
}

function scaleBannerVideoSize(element) {
  var windowWidth = $(window).width(),
    windowHeight = $(window).height() + 5,
    videoWidth,
    videoHeight;

  // console.log(windowHeight);

  $(element).each(function() {
    var videoAspectRatio = $(this).data("height") / $(this).data("width");

    $(this).width(windowWidth);

    if (windowWidth < 1000) {
      videoHeight = windowHeight;
      videoWidth = videoHeight / videoAspectRatio;
      $(this).css({
        "margin-top": 0,
        "margin-left": -(videoWidth - windowWidth) / 2 + "px"
      });

      $(this)
        .width(videoWidth)
        .height(videoHeight);
    }

    $(".homepage-hero-module .video-container video").addClass(
      "fadeIn animated"
    );
  });
}
//When the start button is clicked, slide the landing page up.
$("#start-button").click(function() {
  $(".homepage-hero-module").slideUp();
});

//When the submit button is clicked slide the form section up.
$("#submit-button").click(function(event) {
  event.preventDefault();
  var userChoice = $("#radius").val() * 1000;
  userDistance.push(userChoice);
  var userLikes = $("#interests").val();
  userInterests.push(userLikes);

  var nameInput = $("#name").val();
  var interestInput = $("#interests").val();
  var locationInput = $("#address").val();
  var radiusInput = $("#radius").val();

  database.ref().push({
    name: nameInput,
    interests: interestInput,
    location: locationInput,
    radius: radiusInput
    // artist: artistInput
  });

  $(".get-user-info").slideUp();
  $("#map, #re-do, .end-section").css("visibility", "visible");

  // getArtistTrack(artistInput);
});
//slides form down to search again.
var reset = $("#re-do").click(function() {
  $(".get-user-info").slideDown();
  $("#map, #re-do, .end-section").css("visibility", "hidden");
});

//initializing map.
var mapsKey = "AIzaSyDaDejXVVUNUIMF_LeRZ8NxSt5Rc8Cb0Mc";
var map;
var markers = [];
var infowindow;
var userDistance = [];
console.log(userDistance);
var userInterests = [];
console.log(userInterests);

function initMap() {
  var center = { lat: 26.122438, lng: -80.137314 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 11
  });
  var geocoder = new google.maps.Geocoder();
  document
    .getElementById("submit-button")
    .addEventListener("click", function() {
      geocodeAddress(geocoder, map);
    });

  function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById("address").value;
    geocoder.geocode({ address: address }, function(results, status) {
      if (status === "OK") {
        resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location
        });
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.textSearch(
          {
            location: results[0].geometry.location,
            radius: userDistance[userDistance.length - 1],
            query: userInterests[userInterests.length - 1]
            // openNow: true
          },
          callback
        );
      } else {
        bootbox.alert({
          size: "large",
          title: "Oops!",
          message: "Looks like you mispelled something!",
          callback: function() {
            $(".get-user-info").slideDown();
          }
        });
      }
    });
  }
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var photos = place.photos;
  if (!photos) {
    return;
  }
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name
    // icon: photos[0].getUrl({ 'maxWidth': 75, 'maxHeight': 75 })
  });

  google.maps.event.addListener(marker, "click", function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

database.ref().on(
  "child_added",
  function(snapshot) {
    // Log everything that's coming out of snapshot

    // console.log(snapshot.val());
    // console.log(snapshot.val().name);
    // console.log(snapshot.val().artist);

    // Change the HTML to reflect

    $("#populate-name").html(
      snapshot.val().name + ", thanks for checking out bounce."
    );
    // Handle the errors
  },
  function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  }
);

//Music player
// function getArtistTrack(artist) {

//     var queryURL = "https://api.spotify.com/v1/search?q=" + artist + "&type=artist";

//     $.ajax({
//         method: "GET",
//         url: queryURL,
//     }).done(function(response) {
//         console.log(response);
//         var artistID = response.artists.items[0].id;

//         var queryURLTracks = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";
//         $.ajax({
//             url: queryURLTracks,
//             method: "GET"
//         }).done(function(trackResponse) {

//             console.log(trackResponse);
//             var player = "<iframe src='https://embed.spotify.com/?uri=spotify:track:" +
//                 trackResponse.tracks[0].id +
//                 "' frameborder='0' allowtransparency='true'></iframe>";

//             // Appending the new player into the HTML
//             $("#music-player").append(player);
//         });
//     });
// }
