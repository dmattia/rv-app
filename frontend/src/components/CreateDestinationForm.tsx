import {
  useCreateOrUpdateDestinationMutation,
  LocationInformation,
} from "@rv-app/generated-schema";
import { Modal, Button, Input } from "@nextui-org/react";
import { useState } from "react";
import { MdPlace } from "react-icons/md";
import { LocationAutocomplete } from "./LocationAutocomplete";

export function CreateDestinationForm() {
  const [modalVisible, setModalVisible] = useState(false);
  const [destinationName, setDestinationName] = useState("");
  const [locationInformation, setLocationInfo] = useState<
    LocationInformation | undefined
  >(undefined);

  const [createDestination, { loading, error }] =
    useCreateOrUpdateDestinationMutation({
      refetchQueries: ["listDestinations"],
    });
  const onSubmit = () => {
    createDestination({
      variables: {
        input: {
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
        },
      },
    });
    setModalVisible(false);
  };

  return (
    <>
      <Button color="primary" ghost auto onClick={() => setModalVisible(true)}>
        Create New Destination
      </Button>
      {error && <p>{error.message}</p>}

      <Modal
        aria-labelledby="modal-title"
        open={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Modal.Header>
          <div className="p-6 uppercase font-bold text-xl overflow-hidden truncate text-center">
            Add a new Destination
          </div>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            disabled={loading}
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Destination Name"
            placeholder="Name"
            contentLeft={<MdPlace />}
            onChange={(e) => setDestinationName(e.target.value)}
          />
          <LocationAutocomplete
            onLocationSelected={(info) => setLocationInfo(info)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onClick={() => setModalVisible(false)}
          >
            Cancel
          </Button>
          <Button auto flat disabled={loading} onClick={onSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
