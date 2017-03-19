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

var myBases = new GeoJSON.FeatureCollection( example2 );

console.log( myBases.getFeatureByPropertyValue( "id", 2 ).properties.label ); //  "Second Base"
console.log( myBases.bbox ); //  [40,10,50,50]
myBases.addFeature({
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates":[0,40]
  },
  "properties": {
    "id": 3,
    "label": "Third Base"
  }
});
console.log( myBases.bbox ); // [0,10,50,50]
```

## Installation

1. [Download](https://github.com/lacockj/GeoJSON-js/archive/master.zip) or clone this repo.
2. Include the GeoJSON.js script in your web app.

```js
<script src="GeoJSON.js"></script>
```

## Reference

There are currently four object classes at your disposal in this script, each
starts with the standard GeoJSON data format, then adds a few convenience methods.

- FeatureCollection
- Feature
- Geometry
- BBox

### Methods Common to All GeoJSON-js Classes

#### Construction:

All class object constructors in GeoJSON-js expect input in the the standard
GeoJSON format. See [RFC7946](https://tools.ietf.org/html/rfc7946) for details.

```js
var fc = new GeoJSON.FeatureCollection( featureCollectionData );
var f = new GeoJSON.Feature( featureData );
var g = new GeoJSON.Geometry( featureGeometryData );

```

#### Getting the Bounding-Box

For all classes, the `bbox` property is automatically calculated when accessed.

```js
var bbox = g.bbox;
var southernmostLatitude = f.bbox[0];
```

#### Converting to JSON string:

Class methods and housekeeping properties are automatically stripped out by the
`toJSON()` method and when using `JSON.stringify( myObj )`.

```js
var jsonString = JSON.stringify( myFeatureClassObject );
var plainObject = myFeatureClassObject.toJSON();
```

### FeatureCollection

#### Adding one feature:

```js
fc.addFeature( featureData );
// or
fc.features.push( new GeoJSON.Feature( featureData );
```

#### Adding multiple features:

```js
fc.addFeatures( arrayOfFeaturesData );
```

#### Getting a specific feature by the feature's property value:

```js
var featureClassObject = fc.getFeatureByPropertyValue( propertyKey, desiredValue );
```

#### Getting the Bounding-Box

For the `FeatureCollection` class, the `bbox` is updated when new features are
added with the `addFeature` and `addFeatures` methods.

### Feature

There are currently no helper methods unique to the `Feature` class, but it
still has the same convenience `bbox` property and `toJSON` method.

### Geometry

The `Geometry` class is primarily intended for internal use, and is automatically used
within any new `Feature` Class objects, but you're free to use it if you like.

The `Geometry` class does the work of verifying incoming data is a supported
GeoJSON type and that all lineStrings are "closed", and does the bounding-box
calculations. If an invalid `'type'` is given, `Geometry` will throw an
"Unsupported geometry type" error. If the first and last points are not the
same, it adds a copy of the first point to the end.

### Bbox

Like the `Geometry` class, the `Bbox` class is mostly intended for internal use,
but if all you need is to do some bounding-box calculations, the `Bbox` class
does not depend on any other GeoJSON-js classes.

#### Construction:

The `BBox` class expects an array of four or six numbers specifying the minimum
and maximum extents of a feature's geometry.
- 2-dimensional: [ minX, minY, maxX, maxY ]
- 3-dimensional: [ minX, minY, minZ, maxX, maxY, maxZ ]

```js
var bboxObject = new GeoJSON.Bbox( bboxArray );
```

#### Expanding to Include More Points

The `expand` method accepts any standard GeoJSON-format `coordinates` array,
from "Point" to "MultiPolygon" and anywhere between.

```js
bboxObject.expand( feature.geometry.coordinates );
```

#### Merging Two Bbox Class Objects

The `merge` method expands a `Bbox` to include the extent of another `Bbox`.

```js
bboxObject.merge( otherBboxObject );
```

#### Getting Back the Bbox Array

```js
var bboxArray = bboxObject.toJSON();
```
