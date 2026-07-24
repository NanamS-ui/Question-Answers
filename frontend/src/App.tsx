import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminQuestionnaireDetailPage } from "./pages/admin/AdminQuestionnaireDetailPage";
import { AdminSubmissionsPage } from "./pages/admin/AdminSubmissionsPage";
import { PublicSurveyPage } from "./pages/PublicSurveyPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSurveyPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/questionnaires/:id" element={<AdminQuestionnaireDetailPage />} />
        <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
