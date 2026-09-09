"use client";

import { Button, Field, TextArea, TextInput } from "./ui";

/** A bilingual input row (English | မြန်မာ). */
export function LangRow({
  label,
  en,
  my,
  onEn,
  onMy,
  textarea,
}: {
  label: string;
  en: string;
  my: string;
  onEn: (v: string) => void;
  onMy: (v: string) => void;
  textarea?: boolean;
}) {
  const Input = textarea ? TextArea : TextInput;
  const extra = textarea ? { rows: 3 } : {};
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Field label={`${label} — English`}>
        <Input
          value={en}
          onChange={(e) => onEn(e.target.value)}
          {...extra}
        />
      </Field>
      <Field label={`${label} — မြန်မာ`}>
        <Input
          value={my}
          onChange={(e) => onMy(e.target.value)}
          {...extra}
        />
      </Field>
    </div>
  );
}

/** Editable list of short strings (e.g. curriculum bullet points). */
export function PointsEditor({
  label,
  points,
  onChange,
  addLabel = "+ Add point",
}: {
  label: string;
  points: string[];
  onChange: (v: string[]) => void;
  addLabel?: string;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <div className="space-y-2">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput
              value={p}
              onChange={(e) =>
                onChange(points.map((x, j) => (j === i ? e.target.value : x)))
              }
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => onChange(points.filter((_, j) => j !== i))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="mt-2"
        onClick={() => onChange([...points, ""])}
      >
        {addLabel}
      </Button>
    </div>
  );
}