import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  exchangeCodeForToken,
  verifyState,
  storeTokens,
  getUserInfo,
} from "../services/authentikAuth";
import { clearStoredOAuthParams } from "../utils/pkce";
import { useAuth } from "../contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setOAuthUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // 중복 실행 방지
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리 중이면 무시
      if (isProcessing.current) {
        return;
      }
      isProcessing.current = true;
      try {
        // URL에서 code와 state 가져오기
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // 인증 파라미터 검증
        if (error || !code || !state || !verifyState(state)) {
          throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
        }

        // code → token 교환
        const tokenResponse = await exchangeCodeForToken(code);

        // 토큰 저장 (access_token, refresh_token, 만료 시간)
        storeTokens(tokenResponse);

        // 사용자 정보 조회
        const userInfo = await getUserInfo(tokenResponse.access_token);

        setOAuthUser({
          sub: userInfo.sub,
          email: userInfo.email || "",
          nickname: userInfo.name || userInfo.preferred_username || "",
        });

        // 로그인 성공 후 팀 목록 페이지로 이동
        navigate("/my-teams", { replace: true });
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "인증에 실패했습니다. 다시 로그인해주세요.",
        );

        // OAuth 파라미터 정리
        clearStoredOAuthParams();
      }
    };

    handleCallback();
  }, [searchParams, navigate, setOAuthUser]);

  // 로딩 중 UI
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  // 에러 UI
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
