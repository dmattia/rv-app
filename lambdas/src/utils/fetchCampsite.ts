import got from "got";

import { Campsite } from "./types";

export async function fetchCampsite(id: string): Promise<Campsite> {
  const url = `https://www.recreation.gov/api/camps/campsites/${id}`;
  console.info(`Fetching specific campsite ID ${id} at ${url}`);

  const { statusCode, body } = await got.get(
    url,
    // Recreation.gov seems to use 403 for rate limiting
    { retry: { limit: 5, statusCodes: [403] } }
  );
  if (statusCode !== 200) {
    throw Error(
      `Got unexpected status code ${statusCode} while looking up campsite ${id}`
    );
  }
  const {
    // permitted_equipment,
    type_of_use,
    attributes,
    site_details_map,
    // campsite_type,
  } = JSON.parse(body).campsite;

  // DO NOT SUBMIT: remove
  // console.info(`Found details: ${JSON.stringify(JSON.parse(body).campsite, null, 2)}`)

  let worksForUs = true;
  // Turn this on if you want to limit for our van
  // if (
  //   !permitted_equipment.some(({ equipment_name }: any) =>
  //     ["RV", "RV/Motorhome", "Caravan/Camper Van"].includes(equipment_name)
  //   )
  // ) {
  //   if (campsite_type !== "STANDARD ELECTRIC") {
  //     worksForUs = false;
  //   }
  // }

  if (type_of_use !== "Overnight") {
    console.info(`Found a site that was not overnight: ${JSON.parse(body).campsite}`)
    worksForUs = false;
  }

  // const getAttribute = (desiredName: any) =>
  //   attributes.find(({ attribute_code }: any) => attribute_code === desiredName)
  //     ?.attribute_value ?? site_details_map[desiredName]?.attribute_value;
  // if (!["Domestic", "Yes"].includes(getAttribute("pets_allowed"))) {
  //   worksForUs = false;
  // }

  // if (parseInt(getAttribute("max_vehicle_length") ?? "25", 10) < 24) {
  //   worksForUs = false;
  // }

  return {
    id: id,
    worksForUs,
    website: url,
  };
}
