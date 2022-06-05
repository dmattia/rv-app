import type { CreateOrUpdateDestinationInput } from "@rv-app/schema";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert } from "@aws-amplify/ui-react";
import { gql, useMutation } from "@apollo/client";

const CREATE_DESTINATION = gql`
  mutation MyMutation($input: CreateOrUpdateDestinationInput!) {
    createOrUpdateDestination(input: $input) {
      id
      destinationName
      latitude
      longitude
    }
  }
`;

export function CreateDestinationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrUpdateDestinationInput>();

  const [createDestination, createdDestination] =
    useMutation(CREATE_DESTINATION);
  const onSubmit: SubmitHandler<CreateOrUpdateDestinationInput> = async (
    input
  ) => {
    createDestination({
      variables: { input },
    });
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
      {createdDestination?.data && (
        <Alert
          isDismissible={true}
          hasIcon={true}
          variation="success"
          heading="Success!"
        >
          Created a new destination with ID:{" "}
          {createdDestination?.data?.createOrUpdateDestination?.id}
        </Alert>
      )}
    </>
  );
}
