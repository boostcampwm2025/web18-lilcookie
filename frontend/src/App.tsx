import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/web01" replace />} />
        <Route path="/:teamId" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
