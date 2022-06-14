import {
  CreateOrUpdateDestinationMutationVariables,
  LocationInformation,
} from "@rv-app/generated-schema";
import { Input } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { MdPlace } from "react-icons/md";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { getEntries } from "@transcend-io/type-utils";

export interface CreateOrUpdateDestinationFormProps {
  initialData?: {
    id?: string;
    destinationName?: string | null;
    locationInformation?: LocationInformation | null;
  };

  loading?: boolean;

  onChange?: (updatedVars: CreateOrUpdateDestinationMutationVariables) => void;
}

export function CreateOrUpdateDestinationForm(
  props: CreateOrUpdateDestinationFormProps
) {
  const [destinationName, setDestinationName] = useState(
    props.initialData?.destinationName ?? ""
  );
  const [locationInformation, setLocationInfo] = useState<
    LocationInformation | undefined
  >(props.initialData?.locationInformation ?? undefined);

  useEffect(() => {
    if (!props.onChange) {
      return;
    }

    const fields = {
      id: props.initialData?.id,
      destinationName,
      address: locationInformation?.address,
      latitude: locationInformation?.latitude,
      longitude: locationInformation?.longitude,
      municipality: locationInformation?.municipality,
      subRegion: locationInformation?.subRegion,
      regionName: locationInformation?.regionName,
      country: locationInformation?.country,
      postalCode: locationInformation?.postalCode,
      timeZoneName: locationInformation?.timeZone?.name,
      timeZoneOffset: locationInformation?.timeZone?.offset,
    };
    const nonNullFields = Object.fromEntries(
      getEntries(fields).filter(([_, val]) => val !== null && val !== undefined)
    );

    props.onChange({ input: nonNullFields });
  }, [destinationName, locationInformation]);

  return (
    <>
      <Input
        clearable
        disabled={props.loading ?? false}
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="Destination Name"
        initialValue={destinationName}
        placeholder="Name"
        contentLeft={<MdPlace />}
        onChange={(e) => setDestinationName(e.target.value)}
      />
      <LocationAutocomplete
        onLocationSelected={(info) => setLocationInfo(info)}
      />
    </>
  );
}
