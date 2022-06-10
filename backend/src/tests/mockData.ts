export const FAKE_ID = "60F03770-18C6-45E9-BED9-89CBAB61ED39";
export const FAKE_DESTINATION = "Hogwarts";
export const FAKE_LATITUDE = 12.345;
export const FAKE_LONGITUDE = -6.789;
export const FAKE_MUNICIPALITY = "London";
export const FAKE_SUB_REGION = "Platform 9 3/4";
export const FAKE_REGION = "King's Cross Station";
export const FAKE_POSTAL_CODE = "12345"; // but no post on Sundays
export const FAKE_TIME_ZONE = "London Time";
export const FAKE_TIME_ZONE_OFFSET = 3600;

export const FAKE_DESTINATION_DB_ROW = {
  id: { S: FAKE_ID },
  destinationName: { S: FAKE_DESTINATION },
  latitude: { N: FAKE_LATITUDE },
  longitude: { N: FAKE_LONGITUDE },
  municipality: { S: FAKE_MUNICIPALITY },
  subRegion: { S: FAKE_SUB_REGION },
  regionName: { S: FAKE_REGION },
  postalCode: { S: FAKE_POSTAL_CODE },
  timeZoneName: { S: FAKE_TIME_ZONE },
  timeZoneOffset: { N: FAKE_TIME_ZONE_OFFSET },
};

export const FAKE_DESTINATION_GRAPHQL_TYPE = {
  id: FAKE_ID,
  destinationName: FAKE_DESTINATION,
  locationInformation: {
    latitude: FAKE_LATITUDE,
    longitude: FAKE_LONGITUDE,
    municipality: FAKE_MUNICIPALITY,
    subRegion: FAKE_SUB_REGION,
    regionName: FAKE_REGION,
    postalCode: FAKE_POSTAL_CODE,
    timeZone: {
      offset: FAKE_TIME_ZONE_OFFSET,
      name: FAKE_TIME_ZONE,
    },
  },
};
