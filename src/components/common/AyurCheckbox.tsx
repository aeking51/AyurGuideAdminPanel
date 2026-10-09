import React, { forwardRef, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';

export type AyurCheckboxVariant = 'botanical' | 'classic' | 'amber' | 'card-badge';
export type AyurCheckboxShape = 'squircle' | 'rounded' | 'circle';
export type AyurCheckboxSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AyurCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  indeterminate?: boolean;
  size?: AyurCheckboxSize;
  variant?: AyurCheckboxVariant;
  shape?: AyurCheckboxShape;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const AyurCheckbox = forwardRef<HTMLInputElement, AyurCheckboxProps>(({
  checked = false,
  indeterminate = false,
  size = 'md',
  variant = 'botanical',
  shape = 'squircle',
  label,
  sublabel,
  disabled = false,
  className = '',
  wrapperClassName = '',
  onChange,
  title,
  id,
  ...rest
}, ref) => {
  const innerRef = useRef<HTMLInputElement>(null);
  const resolvedRef = (ref || innerRef) as React.MutableRefObject<HTMLInputElement | null>;

  useEffect(() => {
    if (resolvedRef && resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, resolvedRef]);

  // Size dimensions
  const sizeConfig = {
    xs: { box: 'w-3.5 h-3.5', icon: 'w-2.5 h-2.5', stroke: 'stroke-[3.5]' },
    sm: { box: 'w-4 h-4', icon: 'w-3 h-3', stroke: 'stroke-[3.5]' },
    md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', stroke: 'stroke-[3.5]' },
    lg: { box: 'w-6 h-6', icon: 'w-4 h-4', stroke: 'stroke-[4]' },
  }[size];

  // Shape borders
  const shapeClass = {
    squircle: size === 'lg' ? 'rounded-lg' : size === 'sm' || size === 'xs' ? 'rounded-[4px]' : 'rounded-[6px]',
    rounded: 'rounded-lg',
    circle: 'rounded-full',
  }[shape];

  // Variant styling
  const getVariantStyles = () => {
    const isSelected = checked || indeterminate;

    switch (variant) {
      case 'amber':
        return isSelected
          ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.45)]'
          : 'bg-[#151208] border-[#59421A] text-transparent group-hover:border-amber-400 group-hover:bg-[#231C0D] group-hover:shadow-[0_0_8px_rgba(245,158,11,0.25)]';

      case 'classic':
        return isSelected
          ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
          : 'bg-[#061A11] border-[#295644] text-transparent group-hover:border-emerald-400 group-hover:bg-[#0B2A1D]';

      case 'card-badge':
        return isSelected
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300 text-white shadow-[0_0_14px_rgba(16,185,129,0.55)] scale-105'
          : 'bg-[#061810]/90 backdrop-blur-md border-[#23493C]/90 text-transparent group-hover:border-emerald-400 group-hover:bg-[#0D281C] group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]';

      case 'botanical':
      default:
        return isSelected
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.45)] text-white scale-100'
          : 'bg-[#061A11] border-[#24523F] text-transparent group-hover:border-emerald-400/95 group-hover:bg-[#0C2B1E] group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    }
  };

  return (
    <label
      className={`relative inline-flex items-center gap-2 select-none cursor-pointer group ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${wrapperClassName}`}
      title={title}
      onClick={(e) => {
        // Prevent double toggling if outer elements trigger click
        e.stopPropagation();
      }}
    >
      {/* Visually hidden accessible native input */}
      <input
        ref={resolvedRef}
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only peer"
        {...rest}
      />

      {/* Custom Theme-Crafted Checkbox Frame */}
      <div
        className={`
          ${sizeConfig.box}
          ${shapeClass}
          flex items-center justify-center shrink-0
          transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)
          border-[1.5px]
          peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#081C13]
          active:scale-90
          ${getVariantStyles()}
          ${className}
        `}
      >
        {checked && (
          <Check
            className={`${sizeConfig.icon} text-white ${sizeConfig.stroke} drop-shadow-sm transition-transform duration-200 scale-100 animate-in zoom-in-75`}
          />
        )}
        {!checked && indeterminate && (
          <Minus
            className={`${sizeConfig.icon} text-white ${sizeConfig.stroke} drop-shadow-sm transition-transform duration-200 scale-100 animate-in zoom-in-75`}
          />
        )}
      </div>

      {/* Optional Label & Sublabel */}
      {(label || sublabel) && (
        <div className="flex flex-col leading-tight">
          {label && (
            <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-gray-400">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

AyurCheckbox.displayName = 'AyurCheckbox';
