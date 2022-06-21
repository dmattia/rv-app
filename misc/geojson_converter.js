const { readFileSync, writeFileSync } = require("fs");

const { type, features } = JSON.parse(
  readFileSync("./infra/resources/geofences/states.geojson", "utf8")
);

function convertFeature(feature) {
  // if (feature.geometry.type === 'MultiPolygon') {
  //     return feature.geometry.coordinates.map((coordinates, i) => ({
  //         ...feature,
  //         id: `${feature.id}-${i}`,
  //         geometry: {
  //             type: "Polygon",
  //             coordinates: [coordinates[0].reverse()]
  //         }
  //     }))
  // }

  // We will never drive to these
  if (
    ["Alaska", "Hawaii", "Puerto Rico"].includes(feature.properties.name) ||
    ["24-0", "51-1"].includes(feature.id)
  ) {
    return [];
  }

  if (!feature.id.includes("-")) {
    return [
      {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: [feature.geometry.coordinates[0].reverse()],
        },
      },
    ];
    // return feature.geometry.coordinates.map((coordinates, i) => ({
    //     ...feature,
    //     id: `${feature.id}-${i}`,
    //     geometry: {
    //         type: "Polygon",
    //         coordinates: [coordinates[0].reverse()]
    //     }
    // }))
  }

  return [feature];
}

writeFileSync(
  "./infra/resources/geofences/converted.geojson",
  JSON.stringify(
    {
      type,
      features: features.flatMap(convertFeature),
    },
    null,
    2
  )
);
