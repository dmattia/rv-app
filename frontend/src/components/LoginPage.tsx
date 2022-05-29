import { useAuth } from "../hooks/use_auth";
import { useForm } from "react-hook-form";

export function LoginPage() {
  const auth = useAuth();
  const { register, handleSubmit } = useForm();

  if (auth?.credentials) {
    <p>Already logged in</p>
  }

  return (
    <form onSubmit={handleSubmit(({ username, password }) => auth?.signIn(username, password))}>
      <input {...register("username")} placeholder="Username" />
      <input {...register("password")} placeholder="Password" type="password" />
      <input type="submit" />
    </form>
  );
}
