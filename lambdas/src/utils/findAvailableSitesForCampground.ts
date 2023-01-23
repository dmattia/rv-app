import got from "got";
import { mapSeries } from "bluebird";

import { fetchCampsite } from "./fetchCampsite";
import { Month } from "./types";

export async function findAvailableSitesForCampground(
  id: string,
  months: Month[] = [
    Month.JANUARY,
    Month.FEBRUARY,
    Month.MARCH,
    Month.APRIL,
    Month.MAY,
    Month.JUNE,
    Month.JULY,
    Month.AUGUST,
    Month.SEPTEMBER,
    Month.OCTOBER,
    Month.NOVEMBER,
    Month.DECEMBER,
  ]
): Promise<Map<string, string[]>> {
  // Fetch the campsite information by month
  const monthlyCampgrounds = await mapSeries(months, async (month) => {
    const { body, statusCode } = await got.get(
      `https://www.recreation.gov/api/camps/availability/campground/${id}/month?start_date=2023-${month}-01T00%3A00%3A00.000Z`,
      // Recreation.gov seems to use 403 for rate limiting
      { retry: { limit: 5, statusCodes: [403] } }
    );
    if (statusCode !== 200) {
      console.error("failed to check campground availability");
      throw Error(`got unexpected status ${statusCode}`);
    }
    const parsedBody = JSON.parse(body);

    return Object.values(parsedBody.campsites)
      .filter(({ type_of_use }: any) => type_of_use === "Overnight")
      .flatMap(({ campsite_id, availabilities }: any) => {
        const openDates = Object.entries(availabilities)
          .filter(
            ([_, availabilityStatus]) => "Available" === availabilityStatus
          )
          .map(([date]) => date.replace(/T.*/, ""));
        if (!openDates.length) {
          return [];
        }

        return [
          {
            id: campsite_id as string,
            availableDates: openDates,
          },
        ];
      });
  });

  // Filter to only campgrounds that meet our needs
  const allCampgrounds = new Set(
    monthlyCampgrounds.flatMap((campgrounds) =>
      campgrounds.flatMap(({ id }) => [id])
    )
  );
  const filledCampsites = await mapSeries([...allCampgrounds], fetchCampsite);
  const workingCampgrounds = new Set(
    filledCampsites.filter(({ worksForUs }) => worksForUs).map(({ id }) => id)
  );

  // Combine all of the results
  const results = new Map<string, string[]>();
  monthlyCampgrounds.forEach((monthlyCampground) => {
    monthlyCampground.forEach(({ id, availableDates }) => {
      if (workingCampgrounds.has(id)) {
        availableDates.forEach((date) => {
          results.set(date, [...(results.get(date) ?? []), id]);
        });
      }
    });
  });
  return results;
}
