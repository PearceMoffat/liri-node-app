var request = require('request');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var colors = require('colors');
var fs = require('fs');
var keys = require('./keys.js');

var clientSpotify = new Spotify({
    id: keys.spotify_id,
    secret: keys.spotify_secret
});

var clientTwitter = new Twitter({
    consumer_key: keys.twitter_consumer_key,
    consumer_secret: keys.twitter_consumer_secret,
    access_token_key: keys.twitter_access_token_key,
    access_token_secret: keys.twitter_access_token_secret
});

// main function, pass the command and info that the user inputs
function runIt(command, info) {
    switch(command) {
        case "my-tweets": // User wants tweets
            Tweet();
            break;
        case "spotify-this-song": // User wants song info
            if (info != "") {Spot(info);}
            else {Spot(["the","sign"]);} // Default song name if user does not input one
            break;
        case "movie-this": // User wants movie info
            if (info != "") {Movie(info);}
            else {Movie(["mr","nobody"]);} // Default movie name if user does not input one
            break;
        case "do-what-it-says": // User wants to use the text file command
            whatItSays();
            break;
        default: // User input an invalid command, display valid commands
            console.log("Invalid command input".red);
            console.log("Valid commands are:".blue);
            console.log("my-tweets".cyan);
            console.log("spotify-this-song <song name here>".cyan);
            console.log("movie-this <movie name here>".cyan);
            console.log("do-what-it-says".cyan);
    }
}

// Get the tweets
function Tweet() {
    console.log("==================================================================".zebra);
    // Call the Twitter API
    clientTwitter.get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=PearceMoffat&count=20", 
                function(error, tweets, response) {
        for(var i=0; i<tweets.length; i++) { // Loop through tweets
            console.log(tweets[i].text.cyan); // Display the tweet
            console.log(tweets[i].created_at.cyan); // Display the tweet's date
            console.log("==================================================================".zebra);
        }
    });
}

// Get song info
function Spot(songName) {
    var songQuery = songName.join(" ");
    console.log();
    // Call the spotify API
    clientSpotify.search({ type: 'track', query: songQuery, limit: 3 }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        // Loop through the first 3 results
        for (var i=0; i<data.tracks.items.length; i++) {
            // Display artists, song title, preview link, and album name
            console.log("Artist(s)".yellow.underline);
            for (var j=0; j<data.tracks.items[i].artists.length; j++) {
                console.log(data.tracks.items[i].artists[j].name.magenta);
            }
            console.log("Song Title".yellow.underline);
            console.log(data.tracks.items[i].name.magenta);
            console.log("Ctrl+Click to Preview Song".yellow.underline);
            console.log(data.tracks.items[i].external_urls.spotify.blue);
            console.log("Album Name".yellow.underline);
            console.log(data.tracks.items[i].album.name.magenta); 
            console.log("==================================================================".zebra);
            console.log("=".inverse + "=================================================================".zebra); 
        }
    });
}

// Get movie info
function Movie(movieName) {
    var movieUrl = movieName.join("+");

    // Call the OMDB API
    request("http://www.omdbapi.com/?t=" + movieUrl + "&y=&plot=short&apikey=40e9cece", function(err, resp, body){
        if (!err && resp.statusCode === 200) {
            if (JSON.parse(body).Response != "False") { // Make sure the movie exists
                // Display the movie title, release year, ratings, countries, languages, plot, and actors
                console.log(JSON.parse(body).Title.rainbow);
                console.log(JSON.parse(body).Year.rainbow);
                console.log(JSON.parse(body).Ratings[0].Value.rainbow + " on IMDB".rainbow);
                console.log(JSON.parse(body).Ratings[1].Value.rainbow + " on Rotten Tomatoes".rainbow);
                console.log(JSON.parse(body).Country.rainbow);
                console.log(JSON.parse(body).Language.rainbow);
                console.log(JSON.parse(body).Plot.rainbow);
                console.log(JSON.parse(body).Actors.rainbow);
            }
            else {
                console.log(JSON.parse(body).Error);
            }
        }
    });
}

// Do what the text file says
function whatItSays() {
    // Read the info from the text file
    fs.readFile("random.txt", "utf8", function(err, data) {
        var text = data.split(",");
        var newCommand = text[0];
        var newInfo = text[1].split(" ");
        // Run the main function again with info pulled from the file
        runIt(newCommand, newInfo);
    })
}

// Run the main function with user's input
runIt(process.argv[2], process.argv.slice(3));