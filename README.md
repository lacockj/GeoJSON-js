# GeoJSON-js

Use GeoJSON data as a JavaScript Object, including handy object methods.

GeoJSON is a great format for sharing mapping data across different systems and
programming languages, especially JavaScript. But on its own, GeoJSON is just a
block of data. This `GeoJSON` Object adds handy reference and utility functions
to the data, without changing how you would access the data were it an ordinary
JavaScript Object.

## A Quick Example

```js
var myData = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates":[[[20,0],[30,0],[30,10],[20,10],[20,0]]]
  },
  "properties": {
    "id": 1,
    "label": "First Base"
  }
}

var myGeoJson = new GeoJSON( myData );

console.log( myGeoJSON.bbox ); //  [20,0,30,10]
```