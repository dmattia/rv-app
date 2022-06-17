import {
  useListDestinationsQuery,
  useDeleteDestinationMutation,
  useCreateOrUpdateDestinationMutation,
  CreateOrUpdateDestinationMutationVariables,
} from "@rv-app/generated-schema";
import { Table, Row, Col, Tooltip, Modal, Button } from "@nextui-org/react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import {
  CreateOrUpdateDestinationForm,
  CreateOrUpdateDestinationFormProps,
} from "./CreateOrUpdateDestinationForm";
import { useState, useEffect } from "react";

export function DestinationTable() {
  const [modalVisible, setModalVisible] = useState(false);
  const [formState, setFormState] = useState<
    CreateOrUpdateDestinationMutationVariables | undefined
  >(undefined);
  const [rowToUpdate, setRowToUpdate] =
    useState<CreateOrUpdateDestinationFormProps["initialData"]>(undefined);

  // Clear the form whenever the modal closes
  useEffect(() => {
    if (!modalVisible) {
      setRowToUpdate(undefined);
    }
  }, [modalVisible]);

  // Define the mutations this component can call
  const [createOrUpdateDestination, createOrUpdateResult] =
    useCreateOrUpdateDestinationMutation({
      refetchQueries: ["listDestinations"],
    });
  const [deleteDestination] = useDeleteDestinationMutation({
    refetchQueries: ["listDestinations"],
  });

  // Handle the create or update form submitting
  const onSubmit = () => {
    createOrUpdateDestination({
      variables: formState,
    });
    setModalVisible(false);
  };

  const { data, loading, error } = useListDestinationsQuery();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    console.error(error);
    return <p>An error occurred</p>;
  }

  if (createOrUpdateResult.error) {
    console.error(createOrUpdateResult.error);
    return <p>An error occurred</p>;
  }

  const tableRows = (data.listDestinations ?? []).map(
    ({ id, destinationName, locationInformation, category, priority }) => (
      <Table.Row key={id}>
        <Table.Cell>{destinationName}</Table.Cell>
        <Table.Cell>{locationInformation?.address}</Table.Cell>
        <Table.Cell>
          ({locationInformation?.longitude}, {locationInformation?.latitude})
        </Table.Cell>
        <Table.Cell>{locationInformation?.municipality}</Table.Cell>
        <Table.Cell>{locationInformation?.postalCode}</Table.Cell>
        <Table.Cell>{locationInformation?.regionName}</Table.Cell>
        <Table.Cell>{locationInformation?.subRegion}</Table.Cell>
        <Table.Cell>
          {locationInformation?.timeZone?.name} (
          {locationInformation?.timeZone?.offset})
        </Table.Cell>
        <Table.Cell>{category}</Table.Cell>
        <Table.Cell>{priority ?? "Not set"}</Table.Cell>
        <Table.Cell>
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <Tooltip content="Details">
                <button
                  className="p-2"
                  onClick={() => console.log("View Destination", id)}
                >
                  <FaEye size={20} />
                </button>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip content="Edit destination">
                <button
                  className="p-2"
                  onClick={() => {
                    setRowToUpdate({
                      id,
                      locationInformation,
                      destinationName,
                      category: category ?? undefined,
                      priority: priority ?? undefined,
                    });
                    setModalVisible(true);
                  }}
                >
                  <FaEdit size={20} />
                </button>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip content="Delete destination" color="error">
                <button
                  className="p-2"
                  onClick={() => deleteDestination({ variables: { id } })}
                >
                  <FaTrash size={20} />
                </button>
              </Tooltip>
            </Col>
          </Row>
        </Table.Cell>
      </Table.Row>
    )
  );

  return (
    <>
      <Button color="primary" ghost auto onClick={() => setModalVisible(true)}>
        Create New Destination
      </Button>

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
          <CreateOrUpdateDestinationForm
            onChange={setFormState}
            loading={createOrUpdateResult.loading}
            initialData={rowToUpdate}
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

      <Table>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Address</Table.Column>
          <Table.Column>Location</Table.Column>
          <Table.Column>Municipality</Table.Column>
          <Table.Column>Postal Code</Table.Column>
          <Table.Column>Region</Table.Column>
          <Table.Column>SubRegion</Table.Column>
          <Table.Column>Time Zone</Table.Column>
          <Table.Column>Category</Table.Column>
          <Table.Column>Priority</Table.Column>
          <Table.Column hideHeader={true}>actions</Table.Column>
        </Table.Header>
        <Table.Body>{tableRows}</Table.Body>
      </Table>
    </>
  );
}
