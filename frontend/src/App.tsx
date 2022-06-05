import { CreateDestinationForm, MapComponent, UserProfile } from "./components";
import { AmplifyProvider, Apollo } from "./providers";

export default function App() {
  return (
    <AmplifyProvider>
      <Apollo>
        <div>
          <p>Bri and David's RV Website</p>

          <UserProfile />
          <MapComponent />
          <CreateDestinationForm />
        </div>
      </Apollo>
    </AmplifyProvider>
  );
}
