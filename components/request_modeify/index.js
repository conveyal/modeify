var request = require('fetchy-request');
var request1 = require('fetchy-request');


request('https://www.amigocloud.com/api/v1/me/geocoder/autocomplete?text=palo&token=R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN')
    .then(function (response) {
        return response.json()
        console.log(response)
    }).then(function (json) {
    console.log('parsed json', json)
});


request1({
    uri: 'https://www.amigocloud.com/api/v1/me/geocoder/autocomplete',
    method: 'GET',
    qs: {
        text1: 'palo',
        token: 'R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN'
    }
});

