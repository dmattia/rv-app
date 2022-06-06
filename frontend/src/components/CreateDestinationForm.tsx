import { useCreateOrUpdateDestinationMutation } from "@rv-app/generated-schema";
import { Modal, Button, Input } from "@nextui-org/react";
import { useState } from "react";
import { MdPlace } from "react-icons/md";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";

export function CreateDestinationForm() {
  const [modalVisible, setModalVisible] = useState(false);
  const [destinationName, setDestinationName] = useState("");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");

  const [createDestination, { loading, error }] =
    useCreateOrUpdateDestinationMutation({
      refetchQueries: ["listDestinations"],
    });
  const onSubmit = () => {
    createDestination({
      variables: {
        input: {
          destinationName,
          latitude,
          longitude,
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
          {/*
           * Replace latitude and longitude inputs with an autocompleting location search.
           *
           * We can search for generic text via:
           * aws-vault exec personal --region=us-east-1 --no-session -- aws location search-place-index-for-suggestions \
           *             --index-name esri \
           *             --text "3913 Some Address Trail" \
           *             --filter-countries "USA" \
           *             --language "en" \
           *             --max-results 3
           *
           * And we can then lookup the info about an address that the user clicks via:
           * aws-vault exec personal --region=us-east-1 --no-session -- aws location search-place-index-for-text \
           *             --index-name esri \
           *             --text "3913 Some Address Trl, Saint Paul, MN, 55122, USA" \
           *             --max-results 1
           */}
          <Input
            clearable
            disabled={loading}
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Latitude"
            placeholder="latitude"
            contentLeft={<TbWorldLatitude />}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <Input
            clearable
            disabled={loading}
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Longitude"
            placeholder="longitude"
            contentLeft={<TbWorldLongitude />}
            onChange={(e) => setLongitude(e.target.value)}
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
