import { CreateDestinationForm, MapComponent, UserProfile } from "./components";
import { AmplifyProvider, Apollo } from "./providers";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <AmplifyProvider>
      <Apollo>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UserProfile />}>
              <Route index element={<UserProfile />} />
              <Route path="destinations" element={<MapComponent />}>
                <Route path="map" element={<MapComponent />} />
                <Route path="new" element={<CreateDestinationForm />} />
                <Route index element={<MapComponent />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Apollo>
    </AmplifyProvider>
  );
}
