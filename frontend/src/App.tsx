import {
  CreateDestinationForm,
  MapComponent,
  UserProfile,
  Sidebar,
} from "./components";
import { AmplifyProvider, Apollo } from "./providers";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <AmplifyProvider>
      <Apollo>
        <BrowserRouter>
          <main style={{ height: "100vh", display: "flex" }}>
            <Sidebar />
            <Routes style={{ "flex-direction": "column" }}>
              <Route exact path="/" element={<UserProfile />} />
              <Route path="/destinations">
                <Route exact path="map" element={<MapComponent />} />
                <Route exact path="new" element={<CreateDestinationForm />} />
                <Route index element={<MapComponent />} />
              </Route>
              <Route element={<p>Not Found</p>} path="*" />
            </Routes>
          </main>
        </BrowserRouter>
      </Apollo>
    </AmplifyProvider>
  );
}
