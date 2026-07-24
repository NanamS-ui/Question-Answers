import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminQuestionnaireDetailPage } from "./pages/admin/AdminQuestionnaireDetailPage";
import { AdminQuestionnaireResultsPage } from "./pages/admin/AdminQuestionnaireResultsPage";
import { AdminSubmissionsPage } from "./pages/admin/AdminSubmissionsPage";
import { PublicSurveyPage } from "./pages/PublicSurveyPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSurveyPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="questionnaires/:id" element={<AdminQuestionnaireDetailPage />} />
          <Route
            path="questionnaires/:id/results"
            element={<AdminQuestionnaireResultsPage />}
          />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
