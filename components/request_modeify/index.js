var request = require('request');

request('https://www.amigocloud.com/api/v1/me/geocoder/autocomplete?text=palo&token=R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("body", body);
    console.log("response",response);
    console.log("error", error)
  }
});

