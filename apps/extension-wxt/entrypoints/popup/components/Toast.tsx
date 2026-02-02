import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "error" | "success";
  onClose: () => void;
  autoClose?: number;
};

function Toast({ message, type, onClose, autoClose = 3000 }: ToastProps) {
  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast ${type === "error" ? "toast-error" : "toast-success"}`}>
        <span className="toast-message">{message}</span>
        <button className="toast-close" type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default Toast;
