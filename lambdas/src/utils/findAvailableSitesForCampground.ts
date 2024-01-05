import got from "got";
import { mapSeries } from "bluebird";

import { fetchCampsite } from "./fetchCampsite";
import { MonthAndYear, Month } from "./types";

export async function findAvailableSitesForCampground(
  id: string,
  months: MonthAndYear[] = [
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
  ].map(month => ({ month, year: new Date().getFullYear() }))
): Promise<Map<string, string[]>> {
  // Fetch the campsite information by month
  const monthlyCampgrounds = await mapSeries(months, async (month) => {
    const url = `https://www.recreation.gov/api/camps/availability/campground/${id}/month?start_date=${month.year}-${month.month}-01T00%3A00%3A00.000Z`;
    console.info(`For month ${month.month} in year ${month.year} in campground ${id}, checking at ${url}`);

    const { body, statusCode } = await got.get(
      url,
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
            ([_, availabilityStatus]) => ["Open", "Available"].includes(availabilityStatus as string)
          )
          .map(([date]) => date.replace(/T.*/, ""));
        if (!openDates.length) {
          return [];
        }

        // DO NOT SUBMIT
        console.info(JSON.stringify({
          id: campsite_id as string,
          availableDates: openDates,
        }, null, 2));

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
  const workingCampgrounds = new Set<string>();
  filledCampsites.forEach(campsite => {
    if (campsite.worksForUs && !workingCampgrounds.has(campsite.id)) {
      workingCampgrounds.add(id);
    }
  });

  // DO NOT SUBMIT
  console.info(`WorkingCampgrounds has size ${workingCampgrounds.size}`);
  [...workingCampgrounds].forEach(campsite => {
    console.info(`Found: ${id}`)
  });

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
