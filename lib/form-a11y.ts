/**
 * Shared accessibility wiring for the site's public forms — registration,
 * admissions inquiry and job application.
 *
 * All three are `noValidate` forms with hand-written validation, so the browser
 * never learns which fields are required or invalid and assistive tech stays
 * silent about it. These helpers put that information into the markup by hand,
 * and keep the ids referenced by `aria-describedby` in a single place so the
 * field and its message can never drift apart.
 */

export type FieldErrors = Record<string, string | undefined>;

/**
 * The id of a field's error message. A form namespaces its fields with a
 * prefix (reg-, inq-, apply-) because several forms share field names.
 */
export function errorId(prefix: string, field: string): string {
  return `${prefix}-${field}-error`;
}

/**
 * Spread onto an input, select or textarea: marks it invalid and points at the
 * message explaining why. Returns nothing while the field is valid.
 *
 * `required` is set separately per field — with `noValidate` it does not
 * trigger the browser's own bubbles, it only tells assistive tech the field is
 * mandatory.
 */
export function invalidProps(
  prefix: string,
  field: string,
  errors: FieldErrors,
): { "aria-invalid"?: boolean; "aria-describedby"?: string } {
  if (!errors[field]) return {};
  return { "aria-invalid": true, "aria-describedby": errorId(prefix, field) };
}
