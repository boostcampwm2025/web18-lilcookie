import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, CheckCircle } from "lucide-react";
import { teamApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";

const InvitePage = () => {
  const { teamUuid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshTeams } = useTeams();

  const [teamName, setTeamName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);

  // 팀 프리뷰 조회 및 이미 가입 여부 확인
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 팀 프리뷰 조회
        const previewResponse = await teamApi.getTeamPreview(teamUuid!);
        if (previewResponse.success) {
          setTeamName(previewResponse.data.teamName);
        } else {
          setError(
            previewResponse.message || "팀 정보를 불러오는데 실패했습니다.",
          );
          return;
        }

        // 로그인된 유저라면 이미 가입된 팀인지 확인
        if (user) {
          const teamsResponse = await teamApi.getMyTeams();
          if (teamsResponse.success) {
            const isMember = teamsResponse.data.some(
              (team) => team.teamUuid === teamUuid,
            );
            setIsAlreadyMember(isMember);
          }
        }
      } catch {
        setError("팀 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamUuid, user]);

  // '예' 버튼 클릭 시
  const handleAccept = async () => {
    try {
      setJoining(true);
      const response = await teamApi.joinTeam(teamUuid!);
      if (response.success) {
        await refreshTeams();
        navigate(`/team/${teamUuid}`);
      } else {
        setError(response.message || "팀 가입에 실패했습니다.");
      }
    } catch {
      setError("팀 가입에 실패했습니다.");
    } finally {
      setJoining(false);
    }
  };

  // '아니오' 버튼 클릭 시
  const handleDecline = () => {
    navigate("/my-teams");
  };

  // 팀으로 이동
  const handleGoToTeam = () => {
    navigate(`/team/${teamUuid}`);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/my-teams")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              내 팀으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 이미 가입된 팀인 경우
  if (isAlreadyMember) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 로고 및 헤더 */}
          <div className="flex items-center gap-4 mb-10 ml-2">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <span className="text-white font-bold text-2xl">TS</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TeamStash</h1>
              <p className="text-gray-600 text-sm">팀 링크 공유 플랫폼</p>
            </div>
          </div>

          {/* 이미 가입됨 카드 */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex flex-col items-center text-center">
              {/* 체크 아이콘 */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              {/* 팀 이름 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {teamName}
              </h2>

              {/* 메시지 */}
              <p className="text-gray-600 mb-8">이미 가입된 팀입니다</p>

              {/* 버튼 영역 */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDecline}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  내 팀으로
                </button>
                <button
                  onClick={handleGoToTeam}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all cursor-pointer"
                >
                  팀으로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 초대 확인 화면
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="flex items-center gap-4 mb-10 ml-2">
          <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <span className="text-white font-bold text-2xl">TS</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TeamStash</h1>
            <p className="text-gray-600 text-sm">팀 링크 공유 플랫폼</p>
          </div>
        </div>

        {/* 초대 카드 */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center">
            {/* 팀 아이콘 */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-blue-600" />
            </div>

            {/* 팀 이름 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{teamName}</h2>

            {/* 초대 메시지 */}
            <p className="text-gray-600 mb-8">이 팀에 가입하시겠습니까?</p>

            {/* 버튼 영역 */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDecline}
                disabled={joining}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                아니오
              </button>
              <button
                onClick={handleAccept}
                disabled={joining}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? "가입 중..." : "예"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
