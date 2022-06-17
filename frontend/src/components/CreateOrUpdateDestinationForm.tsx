import {
  CreateOrUpdateDestinationMutationVariables,
  LocationInformation,
  DestinationCategory,
} from "@rv-app/generated-schema";
import { Input, Dropdown } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { MdPlace } from "react-icons/md";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { getEntries, getValues } from "@transcend-io/type-utils";

export interface CreateOrUpdateDestinationFormProps {
  initialData?: {
    id?: string;
    destinationName?: string | null;
    locationInformation?: LocationInformation | null;
    category?: DestinationCategory;
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
  const [category, setCategory] = useState<DestinationCategory>(
    props.initialData?.category ?? DestinationCategory.Other
  );

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
      category: category,
    };
    const nonNullFields = Object.fromEntries(
      getEntries(fields).filter(([_, val]) => val !== null && val !== undefined)
    );

    props.onChange({ input: nonNullFields });
  }, [destinationName, locationInformation, category]);

  useEffect(() => {
    console.log(`Category is now ${category}`);
  }, [category]);

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
      <Dropdown>
        <Dropdown.Button flat css={{ tt: "capitalize" }}>
          {category}
        </Dropdown.Button>
        <Dropdown.Menu
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={new Set([category])}
          onSelectionChange={(categories) =>
            setCategory([...categories][0] as DestinationCategory)
          }
        >
          {getValues(DestinationCategory).map((category) => (
            <Dropdown.Item key={category}>{category}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
