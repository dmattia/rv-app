import { CreateDestinationForm, MapComponent, UserProfile } from "./components";
import { AmplifyProvider } from "./providers";

export default function App() {
  return (
    <AmplifyProvider>
      <div>
        <p>Bri and David's RV Website</p>

        <UserProfile />
        <MapComponent />
        <CreateDestinationForm />
      </div>
    </AmplifyProvider>
  );
}
