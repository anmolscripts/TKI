"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import type { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance";
import flatpickr from "flatpickr";
import {
  HTMLInputTypeAttribute,
  useEffect,
  useId,
  useRef,
} from "react";

type InputGroupProps = {
  className?: string;
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  fileStyleVariant?: "style1" | "style2";
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  height?: "sm" | "default";
  defaultValue?: string;
};

const DatePickerOne: React.FC<InputGroupProps> = ({
  className,
  label,
  type,
  placeholder,
  required,
  disabled,
  active,
  handleChange,
  icon,
  ...props
}) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<FlatpickrInstance | null>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    pickerRef.current = flatpickr(inputRef.current, {
      mode: "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M j, Y",
      defaultDate: props.value || props.defaultValue || undefined,
      onChange: (_, dateStr) => {
        if (!inputRef.current || !handleChange) {
          return;
        }

        inputRef.current.value = dateStr;
        handleChange({
          target: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>);
      },
    });

    return () => {
      pickerRef.current?.destroy();
      pickerRef.current = null;
    };
  }, [handleChange, props.defaultValue, props.value]);

  useEffect(() => {
    if (!pickerRef.current || !props.value) {
      return;
    }

    pickerRef.current.setDate(props.value, false);
  }, [props.value]);

  return (
    <div className={className}>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={props.name}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder={placeholder || "mm/dd/yyyy"}
          onChange={handleChange}
          value={props.value}
          defaultValue={props.defaultValue}
          required={required}
          disabled={disabled}
          data-active={active}
          data-class="flatpickr-right"
        />

        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
          <Calendar className="size-5 text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerOne;
