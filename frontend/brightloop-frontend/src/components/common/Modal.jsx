import { useEffect } from "react";
import { X } from "lucide-react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "16px",
  overflowY: "auto",
};

const dialogStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.22)",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "24px 26px",
  position: "relative",
  animation: "modalFadeIn 0.18s ease-out",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "18px",
  paddingBottom: "12px",
  borderBottom: "1px solid #edf0f5",
};

const closeButtonStyle = {
  border: 0,
  background: "transparent",
  color: "#7e879f",
  display: "grid",
  placeItems: "center",
  borderRadius: "6px",
  padding: "4px",
  cursor: "pointer",
};

export default function Modal({ isOpen, onClose, title, children, maxWidth = "620px" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && onClose) onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true">
      <div
        style={{ ...dialogStyle, maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "18px", color: "#182033" }}>
            {title}
          </h3>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
