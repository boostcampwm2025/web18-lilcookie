import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
  validateAgreements,
} from "../utils/validation";
import { AxiosError } from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // 폼 상태
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    agreements: {
      termsOfService: false,
      privacyPolicy: false,
      marketingConsent: false,
    },
  });

  // 에러 상태
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    agreements: "",
  });

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 입력 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 입력 시 해당 필드 에러 초기화
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError("");
  };

  // 약관 동의 핸들러
  const handleAgreementChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [field]: checked,
      },
    }));
    setErrors((prev) => ({ ...prev, agreements: "" }));
  };

  // 전체 동의 핸들러
  const handleAllAgreements = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreements: {
        termsOfService: checked,
        privacyPolicy: checked,
        marketingConsent: checked,
      },
    }));
    setErrors((prev) => ({ ...prev, agreements: "" }));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(formData.email) || "",
      password: validatePassword(formData.password) || "",
      passwordConfirm:
        validatePasswordConfirm(formData.password, formData.passwordConfirm) ||
        "",
      nickname: validateNickname(formData.nickname) || "",
      agreements: validateAgreements(formData.agreements) || "",
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        agreements: formData.agreements,
      });

      // 회원가입 성공 시 대시보드로 이동
      navigate("/web01");
    } catch (error) {
      // axios 에러에서 백엔드 메시지 추출
      if (error instanceof AxiosError && error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4 py-8">
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

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
                placeholder="example@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="8~32자 영문, 숫자, 특수문자"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  handleInputChange("passwordConfirm", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                  errors.passwordConfirm
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isSubmitting}
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                  errors.nickname
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="2~12자 한글, 영문, 숫자"
                disabled={isSubmitting}
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center">
                <input
                  id="allAgreements"
                  type="checkbox"
                  checked={
                    formData.agreements.termsOfService &&
                    formData.agreements.privacyPolicy &&
                    formData.agreements.marketingConsent
                  }
                  onChange={(e) => handleAllAgreements(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  disabled={isSubmitting}
                />
                <span className="ml-3 text-sm font-semibold text-gray-900 select-none">
                  전체 동의
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center">
                  <input
                    id="termsOfService"
                    type="checkbox"
                    checked={formData.agreements.termsOfService}
                    onChange={(e) =>
                      handleAgreementChange("termsOfService", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <span className="ml-3 text-sm text-gray-700 select-none">
                    서비스 이용약관 동의{" "}
                    <span className="text-red-500">(필수)</span>
                  </span>
                </div>

                <div className="flex items-center">
                  <input
                    id="privacyPolicy"
                    type="checkbox"
                    checked={formData.agreements.privacyPolicy}
                    onChange={(e) =>
                      handleAgreementChange("privacyPolicy", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <span className="ml-3 text-sm text-gray-700 select-none">
                    개인정보 처리방침 동의{" "}
                    <span className="text-red-500">(필수)</span>
                  </span>
                </div>

                <div className="flex items-center">
                  <input
                    id="marketingConsent"
                    type="checkbox"
                    checked={formData.agreements.marketingConsent}
                    onChange={(e) =>
                      handleAgreementChange(
                        "marketingConsent",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <span className="ml-3 text-sm text-gray-700 select-none">
                    마케팅 정보 수신 동의{" "}
                    <span className="text-gray-500">(선택)</span>
                  </span>
                </div>
              </div>

              {errors.agreements && (
                <p className="text-sm text-red-600">{errors.agreements}</p>
              )}
            </div>

            {/* 제출 에러 메시지 */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "처리 중..." : "회원가입"}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
