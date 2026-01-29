import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TeamPage from "./pages/TeamPage";
import MyTeams from "./pages/MyTeams";
import OAuthApps from "./pages/OAuthApps";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import InvitePage from "./pages/InvitePage";
import SettingPage from "./pages/SettingPage";
import { TeamsProvider } from "./contexts/TeamContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TeamsProvider>
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

            {/* 보호된 라우트 - OAuth 앱 관리 */}
            <Route
              path="/oauth-apps"
              element={
                <ProtectedRoute>
                  <OAuthApps />
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

            {/* 보호된 라우트 - 팀 가입 페이지 */}
            <Route
              path="/team/:teamUuid/invite"
              element={
                <ProtectedRoute>
                  <InvitePage />
                </ProtectedRoute>
              }
            />

            {/* 보호된 라우트 - 팀 설정 페이지 */}
            <Route
              path="/team/:teamUuid/setting"
              element={
                <ProtectedRoute>
                  <SettingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TeamsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
