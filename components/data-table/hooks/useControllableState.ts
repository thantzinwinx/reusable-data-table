import { useCallback, useState } from "react";

export function useControllableState<Value>({
  value,
  defaultValue,
  onChange,
}: {
  value: Value | undefined;
  defaultValue: Value;
  onChange?: (value: Value) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internalValue;

  const setValue = useCallback(
    (next: Value) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [current, setValue] as const;
}
