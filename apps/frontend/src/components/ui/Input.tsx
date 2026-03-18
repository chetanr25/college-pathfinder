import React from 'react';
import theme from '../../theme';

export interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  label,
  hint,
  error,
  disabled = false,
  required = false,
  min,
  max,
  className = '',
  style = {},
}) => {
  const inputWrapperStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: icon ? `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[12]}` : theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    border: `2px solid ${error ? theme.colors.error.main : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: theme.typography.fontFamily.primary,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
    ...style,
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    left: theme.spacing[4],
    top: label ? 'calc(50% + 12px)' : '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.text.secondary,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
    opacity: 0.6,
  };

  const hintStyles: React.CSSProperties = {
    display: 'block',
    fontSize: theme.typography.fontSize.xs,
    color: error ? theme.colors.error.main : theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  };

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: theme.colors.error.main }}> *</span>}
        </label>
      )}
      <div style={inputWrapperStyles}>
        {icon && <span style={iconStyles}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          style={inputStyles}
          className="custom-input"
        />
      </div>
      {(hint || error) && <small style={hintStyles}>{error || hint}</small>}
    </div>
  );
};

export default Input;

