# GeoJSON-js

Use GeoJSON data as a JavaScript Object, including handy object methods.

GeoJSON is a great format for sharing mapping data across different systems and
programming languages, especially JavaScript. But on its own, GeoJSON is just a
block of data. This `GeoJSON` Object adds handy reference and utility functions
to the data, without changing how you would access the data were it an ordinary
JavaScript Object.

## A Couple Quick Examples

```js
var example1 = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates":[[[20,0],[30,0],[30,10],[20,10],[20,0]]]
  }
}

var myFeature = new GeoJSON.Feature( example1 );

console.log( myFeature.bbox ); //  [20,0,30,10]


var example2 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates":[50,10]
      },
      "properties": {
        "id": 1,
        "label": "First Base"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates":[40,50]
      },
      "properties": {
        "id": 2,
        "label": "Second Base"
      }
    },
  ]
}

var myFeatureCollection = new GeoJSON.FeatureCollection( example2 );

console.log( myFeatureCollection.bbox ); //  [40,10,50,50]
console.log( myFeatureCollection.getFeatureByPropertyValue( "id", 2 ).properties.label ); //  "Second Base"
```