export const validateUsername = (username: string): string | null => {
  if (!username) return "Tên đăng nhập là bắt buộc.";
  if (username.length < 4 || username.length > 20) {
    return "Tên đăng nhập phải từ 4 đến 20 ký tự.";
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return "Chỉ cho phép chữ cái, số, dấu chấm và gạch dưới.";
  }
  if (username.startsWith(".") || username.startsWith("_") || username.endsWith(".") || username.endsWith("_")) {
    return "Không được bắt đầu hoặc kết thúc bằng dấu . hoặc _";
  }
  if (username.includes("..") || username.includes("__") || username.includes("._") || username.includes("_.")) {
    return "Không được có hai dấu . hoặc _ liên tiếp.";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email là bắt buộc.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email không đúng định dạng.";
  }
  return null;
};

export const validateEmailOrUsername = (value: string): string | null => {
  if (!value) return "Vui lòng nhập Email hoặc Tên đăng nhập.";
  // Nếu có @ thì check theo email, ngược lại check theo username
  if (value.includes("@")) {
    return validateEmail(value);
  }
  return validateUsername(value);
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Mật khẩu là bắt buộc.";
  if (password.length < 8 || password.length > 32) {
    return "Mật khẩu phải từ 8 đến 32 ký tự.";
  }
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*_\-?]/.test(password);
  
  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    return "Phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
  }
  
  const allowedChars = /^[a-zA-Z0-9!@#$%^&*_\-?]+$/;
  if (!allowedChars.test(password)) {
    return "Mật khẩu chứa ký tự không được phép.";
  }
  
  return null;
};

export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!confirm) return "Xác nhận mật khẩu là bắt buộc.";
  if (password !== confirm) {
    return "Mật khẩu xác nhận không khớp.";
  }
  return null;
};
