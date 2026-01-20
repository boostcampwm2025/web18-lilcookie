import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail, validatePassword } from "../utils/validation";
import { AxiosError } from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 폼 상태
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 에러 상태
  const [errors, setErrors] = useState({
    email: "",
    password: "",
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

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(formData.email) || "",
      password: validatePassword(formData.password) || "",
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
      await login({
        email: formData.email,
        password: formData.password,
      });

      // 로그인 성공 시 대시보드로 이동
      navigate("/web01");
    } catch (error) {
      // axios 에러에서 백엔드 메시지 추출
      if (error instanceof AxiosError && error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* 로그인 폼 */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

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
                placeholder="비밀번호를 입력하세요"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* 제출 에러 메시지 */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "처리 중..." : "로그인"}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
