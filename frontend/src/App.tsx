import {
  MapComponent,
  UserProfile,
  Sidebar,
  DestinationTable,
  RecreationGov,
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
            <div className="container overflow-x-auto mx-auto px-4 flex flex-col">
              <Routes>
                <Route path="/" element={<UserProfile />} />
                <Route path="/destinations">
                  <Route path="table" element={<DestinationTable />} />
                  <Route path="map" element={<MapComponent />} />
                  <Route index element={<MapComponent />} />
                </Route>
                <Route path="/recreation" element={<RecreationGov />} />
                <Route element={<p>Not Found</p>} path="*" />
              </Routes>
            </div>
          </main>
        </BrowserRouter>
      </Apollo>
    </AmplifyProvider>
  );
}
