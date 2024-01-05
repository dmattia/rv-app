import {
  Sidebar,
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
