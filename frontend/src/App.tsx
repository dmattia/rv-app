import {
  CreateDestinationForm,
  MapComponent,
  UserProfile,
  Sidebar,
} from "./components";
import { AmplifyProvider, Apollo } from "./providers";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./tailwind.css";

export default function App() {
  return (
    <AmplifyProvider>
      <Apollo>
        <BrowserRouter>
          <main className="flex h-screen">
            <Sidebar />
            <Routes>
              <Route path="/" element={<UserProfile />} />
              <Route path="/destinations">
                <Route path="map" element={<MapComponent />} />
                <Route path="new" element={<CreateDestinationForm />} />
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
