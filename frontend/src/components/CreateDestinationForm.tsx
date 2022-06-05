import type {
  Destination,
  CreateOrUpdateDestinationInput,
} from "@rv-app/schema";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { Alert } from "@aws-amplify/ui-react";
import { API } from "aws-amplify";

export function CreateDestinationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrUpdateDestinationInput>();

  const [newDestination, setDestination] = useState<Destination | undefined>();
  const onSubmit: SubmitHandler<CreateOrUpdateDestinationInput> = async (
    input
  ) => {
    const {
      data: { createOrUpdateDestination },
    } = await API.graphql({
      query: `
            mutation MyMutation($input: CreateOrUpdateDestinationInput!) {
              createOrUpdateDestination(input: $input) {
                id
                destinationName
                latitude
                longitude
              }
            }`.trim(),
      variables: { input },
    });
    setDestination(createOrUpdateDestination);
  };

  return (
    <>
      <h2>Create a destination</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("destinationName", { required: true })}
          placeholder="Destination name"
        />
        {errors.destinationName && <span>This field is required</span>}
        <input
          {...register("latitude", { required: true })}
          placeholder="latitude"
        />
        {errors.latitude && <span>This field is required</span>}
        <input
          {...register("longitude", { required: true })}
          placeholder="longitude"
        />
        {errors.longitude && <span>This field is required</span>}

        <input type="submit" />
      </form>
      {newDestination && (
        <Alert
          isDismissible={true}
          hasIcon={true}
          variation="success"
          heading="Success!"
        >
          Created a new destination with ID: {newDestination.id}
        </Alert>
      )}
    </>
  );
}
