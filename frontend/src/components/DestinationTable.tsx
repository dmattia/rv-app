import { useListDestinationsQuery } from "@rv-app/generated-schema";
import { Table } from "@nextui-org/react";
import { CreateDestinationForm } from "./CreateDestinationForm";

export function DestinationTable() {
  const { data, loading, error } = useListDestinationsQuery();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    console.error(error);
    return <p>An error occurred</p>;
  }

  const tableRows = (data.listDestinations ?? []).map((destination) => (
    <Table.Row key={destination.id}>
      <Table.Cell>{destination.destinationName}</Table.Cell>
      <Table.Cell>{destination.latitude}</Table.Cell>
      <Table.Cell>{destination.longitude}</Table.Cell>
    </Table.Row>
  ));

  return (
    <>
      <CreateDestinationForm />

      <Table>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Latitude</Table.Column>
          <Table.Column>Longitude</Table.Column>
        </Table.Header>
        <Table.Body>{tableRows}</Table.Body>
      </Table>
    </>
  );
}
