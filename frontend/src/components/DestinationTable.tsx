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

  const tableRows = (data.listDestinations ?? []).map(
    ({ id, destinationName, locationInformation }) => (
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
      </Table.Row>
    )
  );

  return (
    <>
      <CreateDestinationForm />

      <Table>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Address</Table.Column>
          <Table.Column>Location</Table.Column>
          <Table.Column>Municipality</Table.Column>
          <Table.Column>Postal Code</Table.Column>
          <Table.Column>Region</Table.Column>
          <Table.Column>SubRegion</Table.Column>
          <Table.Column>timeZone</Table.Column>
        </Table.Header>
        <Table.Body>{tableRows}</Table.Body>
      </Table>
    </>
  );
}
