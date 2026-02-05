import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { GetTeamWebhooksResponseData } from "@repo/api";
import { teamApi } from "../../services/api";
import SectionContainer from "../common/SectionContainer";

interface WebhookSectionProps {
  teamUuid: string;
  webhooks: GetTeamWebhooksResponseData[];
  setWebhooks: React.Dispatch<
    React.SetStateAction<GetTeamWebhooksResponseData[]>
  >;
  isAdmin: boolean;
  onError?: (message: string) => void;
}

export const WebhookSection = ({
  teamUuid,
  webhooks,
  setWebhooks,
  isAdmin,
  onError,
}: WebhookSectionProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [showWebhookInput, setShowWebhookInput] = useState(false);

  const handleAddWebhook = async () => {
    if (!webhookUrl.trim() || !teamUuid) return;

    try {
      setIsAddingWebhook(true);
      const response = await teamApi.addTeamWebhooks(
        teamUuid,
        webhookUrl.trim(),
      );
      if (response.success) {
        setWebhooks((prev) => [...prev, response.data]);
        setWebhookUrl("");
        setShowWebhookInput(false);
      }
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "웹훅 추가에 실패했습니다.";
      onError?.(message);
    } finally {
      setIsAddingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (webhookUuid: string) => {
    if (!teamUuid) return;

    try {
      await teamApi.deleteTeamWebhooks(teamUuid, webhookUuid);
      setWebhooks((prev) => prev.filter((w) => w.webhookUuid !== webhookUuid));
    } catch {
      onError?.("웹훅 삭제에 실패했습니다.");
    }
  };

  const handleToggleWebhook = async (webhook: GetTeamWebhooksResponseData) => {
    if (!teamUuid) return;

    try {
      const response = webhook.isActive
        ? await teamApi.deactivateTeamWebhooks(teamUuid, webhook.webhookUuid)
        : await teamApi.activateTeamWebhooks(teamUuid, webhook.webhookUuid);

      if (response.success) {
        setWebhooks((prev) =>
          prev.map((w) =>
            w.webhookUuid === webhook.webhookUuid ? response.data : w,
          ),
        );
      }
    } catch {
      onError?.("웹훅 상태 변경에 실패했습니다.");
    }
  };

  return (
    <SectionContainer
      title="웹훅 관리"
      badge={isAdmin ? "Owner" : undefined}
      subtitle="팀 내 이벤트 발생 시 데이터를 전송할 URL을 관리합니다."
    >
      {/* 웹훅 목록 */}
      <div className="space-y-3 mb-4">
        {webhooks.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">등록된 웹훅이 없습니다.</p>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook.webhookUuid}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* 토글 스위치 - owner만 클릭 가능 */}
              {isAdmin ? (
                <button
                  onClick={() => handleToggleWebhook(webhook)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    webhook.isActive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      webhook.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              ) : (
                <div
                  className={`relative w-11 h-6 rounded-full ${
                    webhook.isActive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full ${
                      webhook.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              )}

              {/* URL */}
              <span className="flex-1 text-sm text-gray-700 truncate">
                {webhook.url}
              </span>

              {/* 삭제 버튼 - owner만 표시 */}
              {isAdmin && (
                <button
                  onClick={() => handleDeleteWebhook(webhook.webhookUuid)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* 웹훅 추가 - owner만 표시 */}
      {isAdmin &&
        (showWebhookInput ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://전송받을-주소를-입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAddingWebhook}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddWebhook();
                }
              }}
            />
            <button
              onClick={handleAddWebhook}
              disabled={!webhookUrl.trim() || isAddingWebhook}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingWebhook ? "추가 중..." : "추가"}
            </button>
            <button
              onClick={() => {
                setShowWebhookInput(false);
                setWebhookUrl("");
              }}
              className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowWebhookInput(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            웹훅 추가
          </button>
        ))}
    </SectionContainer>
  );
};
