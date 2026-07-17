export default function PrimaryButton({
  children,
  onClick,
  disabled = false
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 6,
        border: "none",
        fontSize: 16
      }}
    >
      {children}
    </button>
  );
}