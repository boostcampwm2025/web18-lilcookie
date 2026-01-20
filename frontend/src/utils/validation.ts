// 폼 입력값 유효성 검사 유틸리티

// 이메일 유효성 검사

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return "이메일을 입력해주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "올바른 이메일 형식이 아닙니다.";
  }

  return null;
};

// 비밀번호 유효성 검사->8~32자 영문 대소문자, 숫자, 특수문자(!@#$%^&*)
export const validatePassword = (password: string): string | null => {
  if (!password || password.trim().length === 0) {
    return "비밀번호를 입력해주세요.";
  }

  const passwordRegex = /^[A-Za-z0-9!@#$%^&*]{8,32}$/;
  if (!passwordRegex.test(password)) {
    return "비밀번호는 8~32자 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 사용할 수 있습니다.";
  }

  return null;
};

// 비밀번호 확인 검사

export const validatePasswordConfirm = (
  password: string,
  passwordConfirm: string
): string | null => {
  if (!passwordConfirm || passwordConfirm.trim().length === 0) {
    return "비밀번호 확인을 입력해주세요.";
  }

  if (password !== passwordConfirm) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return null;
};

// 닉네임 유효성 검사->2~12자 한글, 영문, 숫자만 사용

export const validateNickname = (nickname: string): string | null => {
  if (!nickname || nickname.trim().length === 0) {
    return "닉네임을 입력해주세요.";
  }

  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,12}$/;
  if (!nicknameRegex.test(nickname)) {
    return "닉네임은 2~12자 한글, 영문, 숫자만 사용할 수 있습니다.";
  }

  return null;
};

// 약관 동의 유효성 검사

export const validateAgreements = (agreements: {
  termsOfService: boolean;
  privacyPolicy: boolean;
  marketingConsent: boolean;
}): string | null => {
  if (!agreements.termsOfService) {
    return "서비스 이용약관 동의는 필수입니다.";
  }

  if (!agreements.privacyPolicy) {
    return "개인정보 처리방침 동의는 필수입니다.";
  }

  return null;
};
