var GeoJSON = {};

GeoJSON.supportedGeometryTypes = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"];

/**
 * Geometry
 *
 * @param {string} type The Feature's geometry type. (i.e. "Point", "LineString", or "Polygon")
 * @param {Array} coordinates The Feature's X,Y or X,Y,Z geometry coordinates array.
 */
GeoJSON.Geometry = function( o ) {
  var g = {};
  var x, y, z, ls, p, iLast, lineString, poly;

  if (GeoJSON.supportedGeometryTypes.indexOf( o.type ) === -1 ) {
    throw "Unsupported geometry type: " + o.type + "; Must be one of the following: " + this.supportedGeometryTypes.join(", ");
  }

  g.type = o.type;

  // Point //
  if ( o.type === "Point" ) {
    if ( Array.isArray( o.coordinates ) ) {
      if ( o.coordinates.length === 3 ) {
        x = parseFloat( o.coordinates[0] );
        y = parseFloat( o.coordinates[1] );
        z = parseFloat( o.coordinates[2] );
        g.coordinates = [ x, y, z ];
      } else if ( o.coordinates.length === 2 ) {
        x = parseFloat( o.coordinates[0] );
        y = parseFloat( o.coordinates[1] );
        g.coordinates = [ x, y ];
      } else {
        throw 'Coordinates must be a two-or-three-element array in X,Y,Z* order. *(Z ordinate is optional.)';
      }
    } else {
      throw 'Coordinates must be a two-or-three-element array in X,Y,Z* order. *(Z ordinate is optional.)';
    }
  }

  // LineString //
  else if ( o.type === "LineString" ) {
    if ( Array.isArray( o.coordinates[0] ) ) {
      g.coordinates = o.coordinates;
    } else {
      throw 'Coordinates must be a two-dimentional array of Point coordinates.';
    }
  }

  // Polygon //
  else if ( o.type === "Polygon" ) {
    if ( typeof o.coordinates[0][0] === 'number' ) {
      g.coordinates = [ o.coordinates ];
    } else if ( Array.isArray( o.coordinates[0][0] ) ) {
      g.coordinates = o.coordinates;
    } else {
      throw 'Coordinates must be a three-dimentional array of LineStrings coordinate arrays. The first is the outer LineString; the second is the inner, cut-out LineString.';
    }
    // Ensure polygon closure. //
    for ( ls in g.coordinates ) {
      lineString = g.coordinates[ls];
      iLast = lineString.length - 1;
      if ( lineString[0][0] !== lineString[iLast][0] || lineString[0][1] !== lineString[iLast][1] ) {
        lineString.push( lineString[0] );
      }
    }
  }

  // MultiPolygon //
  else if ( o.type === "MultiPolygon" ) {
    // Parts: entire geometry,            each polygon,                  polygon's outline and cutout,         and the point coordinate set
    if ( Array.isArray(o.coordinates) && Array.isArray(o.coordinates[0]) && Array.isArray(o.coordinates[0][0]) && Array.isArray(o.coordinates[0][0][0] ) ) {
      g.coordinates = o.coordinates;
    } else {
      throw 'MultiPolygon coordinates must be a four-dimentional array.';
    }
    // Ensure polygon closure. //
    for ( p in g.coordinates ) {
      poly = g.coordinates[p];
      for ( ls in poly ) {
        lineString = poly[ls];
        iLast = ls.length - 1;
        if ( lineString[0][0] !== lineString[iLast][0] || lineString[0][1] !== lineString[iLast][1] ) {
          lineString.push( lineString[0] );
        }
      }
    }
  }

  // Unsupported Geometry Type //
  else {
    throw 'Unsupported geometry type. Supported geometry types are "Point", "LineString", and "Polygon".';
  }


  // Bounding-Box //

  g._bbox = null;

  g._calc_bbox = function( recalc ){
    var bb;
    if ( recalc || g._bbox === null ) {
      bb = new GeoJSON.Bbox();
      bb.expand( g.coordinates );
      g._bbox = bb.toJSON();
    }
    return g._bbox;
  }
  Object.defineProperty( g, 'bbox', {
    get: function() { return g._calc_bbox(); }
  });

  // Custom JSON Stringification //
  g.toJSON = function(){
    return {
      type:        g.type,
      coordinates: g.coordinates
    }
  }

  return g;
}


/**
 * Feature
 *
 * @param {string} type The Feature's geometry type. (i.e. "Point", "LineString", or "Polygon")
 * @param {Array} coordinates The Feature's X,Y or X,Y,Z geometry coordinates array.
 * @param {Object} [properties] The Feature's properties.
 */
GeoJSON.Feature = function( o ) {
  var f = {};
  f.type = "Feature";
  f.geometry = new GeoJSON.Geometry( o.geometry );
  f.properties = o.properties || {};
  f.bbox = f.geometry.bbox;

  // Custom JSON Stringification //
  f.toJSON = function(){
    return {
      type:       f.type,
      geometry:   f.geometry,
      properties: f.properties,
      bbox:       f.bbox
    }
  }

  return f;
}

/**
 * Feature Collection
 *
 * @param {Array} features The initial set of GeoJSON.Features to add to the collection.
 */
GeoJSON.FeatureCollection = function( o ) {
  var fc = {};
  var f, p;

  fc.type = "FeatureCollection";
  fc.features = [];
  fc.properties = {};
  fc._bbox = null;

  //Object.defineProperty( fc, 'features', {
  //  get: function() { return fc._features; },
  //  set: function(a) { fc.addFeatures(a); }
  //});

  /**
   * Add a Feature to the FeatureCollection.
   * @param {GeoJSON.Feature} feature
   */
  fc.addFeature = function( feature ) {
    fc.features.push( new GeoJSON.Feature( feature ) );
    fc._bbox = null;
    return fc;
  }

  /**
   * Add multiple Features to the FeatureCollection.
   * @param {GeoJSON.Feature}[] features
   */
  fc.addFeatures = function( features ) {
    var f;
    if ( Array.isArray( o.features ) ) {
      for ( f in features ) {
        fc.addFeature( features[f] );
      }
    }
    return fc;
  }

  /**
   * Searches the FeatureCollection for a Feature that has the specified property value.
   * @param {string} key
   * @param {(string|number|boolean)} value
   * @returns {(GeoJSON.Feature[]|null)} The first matching Feature, or null if not found.
   */
  fc.getFeatureByPropertyValue = function( key, value ) {
    for ( var i in this.features ) {
      if ( this.features[i].properties[key] === value ) {
        return fc.features[i];
      }
    }
    return null;
  }

  // Initial Values //
  if ( typeof o === 'object' ) {
    if ( o.hasOwnProperty( 'features' ) ) {
      fc.addFeatures( o.features );
    }
    if ( o.hasOwnProperty( 'properties' ) && typeof o.properties === 'object' ) {
      for ( p in o.properties ) {
        fc.properties[p] = o.properties[p];
      }
    }
  }

  // Bounding-Box //

  fc._calc_bbox = function( recalc ){
    var bb, f;
    if ( recalc || fc._bbox === null ) {
      bb = new GeoJSON.Bbox();
      for ( f in fc.features ) {
        bb.merge( fc.features[f].bbox );
      }
      fc._bbox = bb.toJSON();
    }
    return fc._bbox;
  }
  Object.defineProperty( fc, 'bbox', {
    get: function() { return fc._calc_bbox(); }
  });

  // Custom JSON Stringification //
  fc.toJSON = function(){
    return {
      type:       fc.type,
      features:   fc.features,
      properties: fc.properties,
      bbox:       fc.bbox
    }
  }

  return fc;
}


/////////////
// Utility //
/////////////

GeoJSON.comparePoints = function(p1, p2){
  if (p1.length === 2 && p2.length === 2) {
    if (p1[0] == p2[0] && p1[1] == p2[1]) {
      return true;
    }
  }
  else if (p1.length === 3 && p2.length === 3) {
    if (p1[0] == p2[0] && p1[1] == p2[1] && p1[2] == p2[2]) {
      return true;
    }
  }
  return false;
}

GeoJSON.Bbox = function( corners ) {
  var bb = {
    min: [],
    max: []
  };

  if ( Array.isArray( corners ) ) {
    if ( corners.length === 4 ) {
      bb.min[0] = corners[0];
      bb.min[1] = corners[1];
      bb.max[0] = corners[2];
      bb.max[1] = corners[3];
    } else if ( corners.length === 6 ) {
      bb.min[0] = corners[0];
      bb.min[1] = corners[1];
      bb.min[2] = corners[2];
      bb.max[0] = corners[3];
      bb.max[1] = corners[4];
      bb.max[2] = corners[5];
    }
  }

  bb.expand = function( coords ){
    var i;
    if ( Array.isArray( coords ) ) {
      if ( Array.isArray( coords[0] ) ) {
        for ( i in coords ) {
          bb.expand( coords[i] );
        }
      } else {
        if ( bb.min.length === 0 ) {
          bb.min[0] = coords[0];
          bb.min[1] = coords[1];
          if ( coords.length > 2 ) bb.min[2] = coords[2];
        } else {
          if ( coords[0] < bb.min[0] ) bb.min[0] = coords[0];
          if ( coords[1] < bb.min[1] ) bb.min[1] = coords[1];
          if ( coords.length > 2 && coords[2] < bb.min[2] ) bb.min[2] = coords[2];
        }
        if ( bb.max.length === 0 ) {
          bb.max[0] = coords[0];
          bb.max[1] = coords[1];
          if ( coords.length > 2 ) bb.max[2] = coords[2];
        } else {
          if ( coords[0] > bb.max[0] ) bb.max[0] = coords[0];
          if ( coords[1] > bb.max[1] ) bb.max[1] = coords[1];
          if ( coords.length > 2 && coords[2] > bb.max[2] ) bb.max[2] = coords[2];
        }
      }
    }
    return bb;
  }

  bb.merge = function( corners ){
    bb2 = new GeoJSON.Bbox( corners );
    bb.expand( bb2.min );
    bb.expand( bb2.max );
    return bb;
  }

  bb.toJSON = function(){
    return bb.min.concat( bb.max );
  }

  return bb;
}
