import {
  CreateOrUpdateDestinationInput,
  useCreateOrUpdateDestinationMutation,
} from "@rv-app/generated-schema";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert, Loader } from "@aws-amplify/ui-react";

export function CreateDestinationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrUpdateDestinationInput>();

  const [createDestination, { data, loading, error }] =
    useCreateOrUpdateDestinationMutation();
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

        <input type="submit" disabled={loading || !!error} />
      </form>
      {loading && <Loader />}
      {data && (
        <Alert
          isDismissible={false}
          hasIcon={true}
          variation="success"
          heading="Success!"
        >
          Created a new destination with ID:{" "}
          {data?.createOrUpdateDestination?.id}
        </Alert>
      )}
    </>
  );
}
