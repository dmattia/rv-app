import { useAuth } from "./hooks/use_auth";
import { LoginPage } from "./components";
import Amplify from "aws-amplify";

Amplify.configure({});

function App() {
  const auth = useAuth();

  if (!auth?.credentials) {
    return <LoginPage />;
  }

  return (
    <>
      <p>Bri and David's RV Website</p>
      <p>{auth.credentials.accessKeyId}</p>
      <p>{auth.credentials.secretAccessKey}</p>
      <p>{auth.credentials.sessionToken}</p>
    </>
  );
}

export default App;
