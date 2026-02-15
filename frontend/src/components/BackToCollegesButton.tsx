import React from "react";
import "./BackToCollegesButton.css";

type Props = {
  onClick?: (e?: React.MouseEvent) => void;
  href?: string;
  className?: string;
  label?: string;
  ariaLabel?: string;
};

/**
 * Reusable "Back to colleges" button component
 * Ensures the button text is always visible on dark/purple backgrounds by forcing white text
 * Usage:
 *  <BackToCollegesButton onClick={() => navigate('/colleges')} />
 *  <BackToCollegesButton href="/colleges" />
 */
const BackToCollegesButton: React.FC<Props> = ({
  onClick,
  href,
  className = "",
  label = "Back to colleges",
  ariaLabel,
}) => {
  const baseClass = `back-to-colleges ${className}`.trim();

  if (href) {
    return (
      <a
        className={baseClass}
        href={href}
        onClick={onClick}
        aria-label={ariaLabel || label}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={baseClass}
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
};

export default BackToCollegesButton;
