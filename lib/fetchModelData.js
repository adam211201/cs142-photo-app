// var Promise = require('Promise');

// /**
//  * FetchModel - Fetch a model from the web server.
//  *     url - string - The URL to issue the GET request.
//  * Returns: a Promise that should be filled
//  * with the response of the GET request parsed
//  * as a JSON object and returned in the property
//  * named "data" of an object.
//  * If the requests has an error the promise should be
//  * rejected with an object contain the properties:
//  *    status:  The HTTP response status
//  *    statusText:  The statusText from the xhr request
//  *
//  */
// function fetchModel(url) {
//   return new Promise((resolve, reject) => {
//     const xhttp = new XMLHttpRequest();

//     xhttp.onreadystatechange = () => {
//       if (xhttp.readyState !== 4) {
//         return;
//       }

//       // Final State but status not OK
//       if (xhttp.status !== 200) {
//         reject({ status: xhttp.status, statusText: xhttp.statusText });
//       }

//       resolve({ data: xhttp.responseText });
//     };
//     xhttp.open('GET', url, true);
//     xhttp.send();
//   });
// }

// export default fetchModel;
