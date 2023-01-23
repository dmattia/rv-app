import got from "got";

import { Campsite } from "./types";

export async function fetchCampsite(id: string): Promise<Campsite> {
  const { statusCode, body } = await got.get(
    `https://www.recreation.gov/api/camps/campsites/${id}`,
    // Recreation.gov seems to use 403 for rate limiting
    { retry: { limit: 5, statusCodes: [403] } }
  );
  if (statusCode !== 200) {
    throw Error(
      `Got unexpected status code ${statusCode} while looking up campsite ${id}`
    );
  }
  const {
    permitted_equipment,
    type_of_use,
    attributes,
    site_details_map,
    campsite_type,
  } = JSON.parse(body).campsite;

  let worksForUs = true;
  if (
    !permitted_equipment.some(({ equipment_name }: any) =>
      ["RV", "RV/Motorhome", "Caravan/Camper Van"].includes(equipment_name)
    )
  ) {
    if (campsite_type !== "STANDARD ELECTRIC") {
      worksForUs = false;
    }
  }

  if (type_of_use !== "Overnight") {
    worksForUs = false;
  }

  const getAttribute = (desiredName: any) =>
    attributes.find(({ attribute_code }: any) => attribute_code === desiredName)
      ?.attribute_value ?? site_details_map[desiredName]?.attribute_value;
  if (!["Domestic", "Yes"].includes(getAttribute("pets_allowed"))) {
    worksForUs = false;
  }

  if (parseInt(getAttribute("max_vehicle_length") ?? "25", 10) < 24) {
    worksForUs = false;
  }

  return {
    id: id,
    worksForUs,
    website: `https://www.recreation.gov/camping/campsites/${id}`,
  };
}
