import { ReactNode, forwardRef, useMemo } from "react";
import cx from "classnames";

type ButtonVariant = "solid" | "outline";
type ButtonSize = "lg" | "md" | "sm";

type IButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IButtonProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = "solid",
      size = "md",
      disabled: _disabled,
      loading = false,
      loadingText,
      className,
      leftIcon,
      rightIcon,
      ...rest
    } = props;

    const disabled = _disabled || loading;

    const classes = useMemo(
      () => createClasses(variant, size, disabled),
      [variant, size, disabled]
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        className={cx(classes, className)}
        {...rest}
      >
        {leftIcon && !loading ? <span className="mr-2">{leftIcon}</span> : null}
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {loadingText ? <span>{loadingText}</span> : children}
        {rightIcon && !loading ? (
          <span className="ml-2">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

const createClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
) => {
  const variantClasses = {
    outline: "btn-outline",
    solid: "btn-solid",
  };

  const sizes = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const classes = cx(
    "btn",
    sizes[size],
    variantClasses[variant],
    disabled && "btn-disabled"
  );

  return classes;
};
