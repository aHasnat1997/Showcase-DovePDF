import { forwardRef } from "react";
import type { ButtonHTMLAttributes, PointerEvent } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const RippleButton = forwardRef<HTMLButtonElement, Props>(
  ({ className = "", onPointerDown, disabled, children, ...rest }, ref) => {
    function spawnRipple(event: PointerEvent<HTMLButtonElement>) {
      onPointerDown?.(event);

      if (disabled) return;

      const btn = event.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.5;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const span = document.createElement("span");
      span.style.cssText = [
        "position:absolute",
        `width:${size}px`,
        `height:${size}px`,
        `left:${x}px`,
        `top:${y}px`,
        "border-radius:50%",
        "background:currentColor",
        "pointer-events:none",
        "animation:ripple 560ms cubic-bezier(0.4,0,0.2,1) forwards",
      ].join(";");

      btn.appendChild(span);
      span.addEventListener("animationend", () => span.remove(), {
        once: true,
      });
    }

    return (
      <button
        {...rest}
        ref={ref}
        disabled={disabled}
        className={`relative overflow-hidden ${className}`}
        onPointerDown={spawnRipple}
      >
        {children}
      </button>
    );
  },
);

RippleButton.displayName = "RippleButton";
