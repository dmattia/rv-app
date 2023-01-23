import {
  useListRecreationGovSubsQuery,
  useCreateOrUpdateRecGovSubMutation,
  RecreationGovSubscription,
} from "@rv-app/generated-schema";
import { Input, Button, Table, Text } from "@nextui-org/react";
import { useState, useCallback } from "react";

export function RecreationGov() {
  const { data, loading, error } = useListRecreationGovSubsQuery();
  const [createOrUpdateRecGovSub, createOrUpdateResult] =
    useCreateOrUpdateRecGovSubMutation({
      refetchQueries: ["listRecreationGovSubs"],
    });

  // Form inputs
  const [campsiteName, setCampsiteName] = useState("");
  const [campsiteId, setCampsiteId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const onSubmit = useCallback(() => {
    // Find all dates in range
    let datesToWatch = [] as string[];
    for (
      let it = new Date(startDate);
      it < new Date(endDate);
      it.setDate(it.getDate() + 1)
    ) {
      datesToWatch = [...datesToWatch, it.toISOString().replace(/T.*/, "")];
    }

    createOrUpdateRecGovSub({
      variables: {
        input: {
          campsiteName,
          campsiteId,
          datesToWatch,
        },
      },
    });
    setCampsiteName("");
    setCampsiteId("");
    setStartDate("");
    setEndDate("");
  }, [campsiteName, campsiteId, startDate, endDate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    console.error(error);
    return <p>An error occurred</p>;
  }

  const tableRows = (
    data.listRecreationGovSubs ?? [
      {
        id: "mock",
        campsiteName: "No Subscriptions Present",
        campsiteId: "",
        datesToWatch: [],
      },
    ]
  ).map(
    ({
      id,
      campsiteName,
      campsiteId,
      datesToWatch,
    }: RecreationGovSubscription) => (
      <Table.Row key={id}>
        <Table.Cell>{campsiteName}</Table.Cell>
        <Table.Cell>{campsiteId}</Table.Cell>
        <Table.Cell>{datesToWatch.join(", ")}</Table.Cell>
      </Table.Row>
    )
  );

  return (
    <>
      <Text h2>List of current subscriptions on recreation.gov</Text>
      <Text h4>
        You can add new subscriptions via the form on the bottom, and you will
        receive a text message when a campsite in that campground becomes
        available.
      </Text>
      <Table striped>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>ID</Table.Column>
          <Table.Column>Dates To Watch</Table.Column>
        </Table.Header>
        <Table.Body>{tableRows}</Table.Body>
      </Table>
      <Input
        clearable
        required
        disabled={createOrUpdateResult.loading ?? false}
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="Campsite Name"
        value={campsiteName}
        placeholder="Name"
        onChange={(e) => setCampsiteName(e.target.value)}
      />
      <Input
        clearable
        required
        disabled={createOrUpdateResult.loading ?? false}
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="Campsite ID"
        value={campsiteId}
        placeholder="ID"
        onChange={(e) => setCampsiteId(e.target.value)}
      />
      <Input
        required
        disabled={createOrUpdateResult.loading ?? false}
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="Start Date"
        placeholder="ID"
        value={startDate}
        type="date"
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        required
        disabled={createOrUpdateResult.loading ?? false}
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="End Date"
        placeholder="ID"
        value={endDate}
        type="date"
        helperText="This is the morning you want to checkout, not the last night of your stay"
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Button
        color="gradient"
        auto
        flat
        disabled={
          loading || !startDate || !endDate || !campsiteId || !campsiteName
        }
        onClick={onSubmit}
      >
        Create Subscription
      </Button>
    </>
  );
}
