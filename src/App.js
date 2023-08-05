
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "./layouts";
import ChartTopic from "./pages/dashboard/chartTopic";

function App() {
  return (
    <Routes>
    <Route path="/dashboard/*" element={<Dashboard />} />
    <Route path="/auth/*" element={<Auth />} /> 
    <Route path="/dashboard/chart/:id" element={<ChartTopic/>} />
    <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
  </Routes>
  );
}

export default App;
