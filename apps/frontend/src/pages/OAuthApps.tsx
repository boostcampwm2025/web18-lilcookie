import { useState, useEffect } from "react";
import { LogOut, Key, Plus, Copy, Check, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { oauthAppsApi } from "../services/api";
import type { OAuthAppResponseData, OAuthAppCreatedResponseData } from "@repo/api";

const OAuthApps = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [oauthApps, setOauthApps] = useState<OAuthAppResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdApp, setCreatedApp] = useState<OAuthAppCreatedResponseData | null>(null);

  // 폼 상태
  const [appName, setAppName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 복사 상태
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const appsRes = await oauthAppsApi.getOAuthApps();
        if (appsRes.success) {
          setOauthApps(appsRes.data);
        }
      } catch {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // 복사 실패 시 무시
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appName.trim()) {
      setCreateError("앱 이름을 입력해주세요.");
      return;
    }

    if (!redirectUri.trim()) {
      setCreateError("Redirect URI를 입력해주세요.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const response = await oauthAppsApi.createOAuthApp({
        name: appName.trim(),
        redirectUris: [redirectUri.trim()],
      });

      if (response.success) {
        setCreatedApp(response.data);
        setOauthApps([response.data, ...oauthApps]);
        setAppName("");
        setRedirectUri("");
        setIsCreateModalOpen(false);
      } else {
        setCreateError(response.message || "앱 생성에 실패했습니다.");
      }
    } catch {
      setCreateError("앱 생성 중 오류가 발생했습니다.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteApp = async (oauthAppUuid: string) => {
    if (!confirm("정말로 이 OAuth App을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await oauthAppsApi.deleteOAuthApp(oauthAppUuid);
      setOauthApps(oauthApps.filter((app) => app.oauthAppUuid !== oauthAppUuid));
    } catch {
      alert("앱 삭제에 실패했습니다.");
    }
  };

  const closeSecretModal = () => {
    setCreatedApp(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">돌아가기</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">{user?.nickname || user?.email?.split("@")[0]}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </header>

      {/* 컨텐츠 */}
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">OAuth 앱 관리</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 앱 만들기</span>
          </button>
        </div>

        {/* 설명 박스 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">OAuth 앱이란?</h3>
          <p className="text-sm text-blue-700">
            OAuth 앱을 생성하면 n8n, Zapier 등 외부 도구에서 TeamStash API를 사용할 수 있습니다. Client ID와 Secret을
            발급받아 외부 서비스에 등록하세요.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : oauthApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">등록된 OAuth 앱이 없습니다</h2>
              <p className="text-sm text-gray-500 mb-6">새 앱을 만들어 외부 서비스와 연동하세요</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                앱 만들기
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {oauthApps.map((app) => (
              <div key={app.oauthAppUuid} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                      <p className="text-xs text-gray-500">생성: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteApp(app.oauthAppUuid)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 break-all">
                        {app.clientId}
                      </code>
                      <button
                        onClick={() => handleCopy(app.clientId, `clientId-${app.oauthAppUuid}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === `clientId-${app.oauthAppUuid}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Redirect URIs</label>
                    <div className="mt-1">
                      {app.redirectUris.map((uri, idx) => (
                        <code
                          key={idx}
                          className="block px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 break-all"
                        >
                          {uri}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scopes</label>
                    <p className="mt-1 text-sm text-gray-600">{app.scopes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 앱 생성 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">새 OAuth 앱 만들기</h2>
              </div>
            </div>

            <form onSubmit={handleCreateApp} className="p-5">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {createError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">앱 이름</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="예: n8n 연동"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URI</label>
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  placeholder="https://your-n8n.example.com/rest/oauth2-credential/callback"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">OAuth 인증 후 리다이렉트될 URL입니다.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? "생성 중..." : "앱 생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Secret 표시 모달 */}
      {createdApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSecretModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">앱이 생성되었습니다!</h2>
                  <p className="text-sm text-gray-500">{createdApp.name}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 font-medium">⚠️ Client Secret은 지금만 확인할 수 있습니다!</p>
                <p className="text-xs text-amber-700 mt-1">
                  이 정보를 안전한 곳에 저장하세요. 창을 닫으면 다시 확인할 수 없습니다.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 break-all">
                      {createdApp.clientId}
                    </code>
                    <button
                      onClick={() => handleCopy(createdApp.clientId, "created-clientId")}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === "created-clientId" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client Secret</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-mono text-red-700 break-all">
                      {createdApp.clientSecret}
                    </code>
                    <button
                      onClick={() => handleCopy(createdApp.clientSecret, "created-clientSecret")}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === "created-clientSecret" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">OAuth 엔드포인트</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Authorization URL
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 break-all">
                        https://auth.teamstash.eupthere.uk/application/o/authorize/
                      </code>
                      <button
                        onClick={() =>
                          handleCopy("https://auth.teamstash.eupthere.uk/application/o/authorize/", "auth-url")
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "auth-url" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access Token URL
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 break-all">
                        https://auth.teamstash.eupthere.uk/application/o/token/
                      </code>
                      <button
                        onClick={() =>
                          handleCopy("https://auth.teamstash.eupthere.uk/application/o/token/", "token-url")
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "token-url" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <a
                    href="https://docs.teamstash.eupthere.uk/integrations-and-api/n8n-Integration-Guide.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <span>🔗 연동 가이드 보기</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <button
                onClick={closeSecretModal}
                className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthApps;
