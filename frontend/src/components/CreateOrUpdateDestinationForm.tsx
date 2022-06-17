import {
  CreateOrUpdateDestinationMutationVariables,
  LocationInformation,
  DestinationCategory,
  Priority,
} from "@rv-app/generated-schema";
import {
  Input,
  Dropdown,
  StyledInputBlockLabel,
  useTheme,
} from "@nextui-org/react";
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
    priority?: Priority;
  };

  loading?: boolean;

  onChange?: (updatedVars: CreateOrUpdateDestinationMutationVariables) => void;
}

export function CreateOrUpdateDestinationForm(
  props: CreateOrUpdateDestinationFormProps
) {
  const { theme } = useTheme();

  const [destinationName, setDestinationName] = useState(
    props.initialData?.destinationName ?? ""
  );
  const [locationInformation, setLocationInfo] = useState<
    LocationInformation | undefined
  >(props.initialData?.locationInformation ?? undefined);
  const [category, setCategory] = useState<DestinationCategory>(
    props.initialData?.category ?? DestinationCategory.Other
  );
  const [priority, setPriority] = useState<Priority | undefined>(
    props.initialData?.priority
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
      category,
      priority,
    };
    const nonNullFields = Object.fromEntries(
      getEntries(fields).filter(([_, val]) => val !== null && val !== undefined)
    );

    props.onChange({ input: nonNullFields });
  }, [destinationName, locationInformation, category, priority]);

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

      {/* Category dropdown */}
      <StyledInputBlockLabel
        className="nextui-input-block-label"
        style={{ color: theme?.colors.primary.value }}
      >
        Category
      </StyledInputBlockLabel>
      <Dropdown>
        <Dropdown.Button flat bordered>
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

      {/* Priority dropdown */}
      <StyledInputBlockLabel
        className="nextui-input-block-label"
        style={{ color: theme?.colors.primary.value }}
      >
        Priority
      </StyledInputBlockLabel>
      <Dropdown>
        <Dropdown.Button flat bordered>
          Priority
        </Dropdown.Button>
        <Dropdown.Menu
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={priority ? new Set([priority]) : undefined}
          onSelectionChange={(priorities) =>
            setPriority([...priorities][0] as Priority | undefined)
          }
        >
          {getValues(Priority).map((priority) => (
            <Dropdown.Item key={priority}>{priority}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
