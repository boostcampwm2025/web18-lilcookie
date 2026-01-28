import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TeamPage from "./pages/TeamPage";
import MyTeams from "./pages/MyTeams";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 루트 경로 - 내 팀 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/my-teams" replace />} />

          {/* 인증 관련 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 보호된 라우트 - 내 팀 목록 */}
          <Route
            path="/my-teams"
            element={
              <ProtectedRoute>
                <MyTeams />
              </ProtectedRoute>
            }
          />

          {/* 보호된 라우트 - 팀 페이지 */}
          <Route
            path="/team/:teamUuid"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
