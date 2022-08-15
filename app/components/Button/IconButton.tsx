import { forwardRef, useMemo, isValidElement, cloneElement } from "react";
import { Button, ButtonProps } from "./Button";
import cx from "classnames";

interface IIconButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "loadingText"> {
  icon?: React.ReactElement;
}

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IIconButtonProps {
  "aria-label"?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const {
      children,
      icon,
      className,
      "aria-label": ariaLabel,
      ...rest
    } = props;

    const element = icon || children;
    const _children = isValidElement(element)
      ? cloneElement(element as any, {})
      : null;

    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        className={cx("btn-icon", className)}
        {...rest}
      >
        {_children}
        <span className="sr-only">{ariaLabel}</span>
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
