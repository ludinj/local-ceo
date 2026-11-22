# Local CEO — Form Architecture Investigation

## 1. Executive Summary

The repository already contains the necessary form foundation to continue with a minimal React Hook Form + Zod architecture, but it does not yet have a shared, reusable form layer.

The key findings are:

- The app already depends on `react-hook-form`, `@hookform/resolvers`, and `zod` in [package.json](package.json).
- A working client-side form exists in [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx).
- The form uses `useForm`, `zodResolver`, `Controller`, `useWatch`, `setValue`, `defaultValues`, and `setError`.
- Server-side validation is already implemented in [lib/actions/company.ts](lib/actions/company.ts) and [lib/validations/company.ts](lib/validations/company.ts).
- There is no shared `FormProvider`, `FormField`, `FormError`, or reusable RHF-aware input abstraction in the app.
- The UI primitives in [components/ui](components/ui) are low-level and should remain low-level; they should not be replaced with a new UI library.

This means the project is ready for a minimal and simple form standard, starting with the upcoming Invite Member modal, without introducing a broader form framework.

---

## 2. Installed Form Dependencies

Verified from [package.json](package.json) and the installed dependency tree:

| Dependency            |   Version | Status                                |
| --------------------- | --------: | ------------------------------------- |
| `react-hook-form`     | `^7.88.0` | Installed and used                    |
| `@hookform/resolvers` |  `^5.9.1` | Installed and used                    |
| `zod`                 |  `^4.6.5` | Installed and used                    |
| `@base-ui/react`      |  `^1.8.0` | Installed, low-level UI foundation    |
| `shadcn`              | `^4.21.0` | Installed, not a runtime form library |

The dependency check run in the workspace confirmed:

- `react-hook-form@7.88.0`
- `@hookform/resolvers@5.9.1`
- `zod@4.6.5`
- `react@19.2.8`

Compatibility notes:

- Next.js 16.3.4 and React 19.2.8 are already used by the app.
- `@hookform/resolvers@5.9.1` supports Zod 3 and 4, matching the repo’s Zod version.
- There is no second form library in use, and no evidence of a different form framework being adopted.

Recommendation:

- Continue with the current `react-hook-form` + `zod` stack.
- Do not add another client-form library unless a future feature clearly requires a different pattern.

---

## 3. Existing Form Implementations

### 3.1 Company creation form

The main form implementation is in [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx).

This form uses:

- `useForm`
- `zodResolver`
- `Controller`
- `useWatch`
- `setValue`
- `setError`
- `defaultValues`
- `handleSubmit`
- `formState.errors`
- `isSubmitting`

The validation schema is in [lib/validations/company.ts](lib/validations/company.ts):

- `companyCreateInputSchema` is a `z.object(...)`
- It includes required and optional string validation
- It trims values and enforces max lengths and required content

The server action logic is in [lib/actions/company.ts](lib/actions/company.ts):

- It calls `companyCreateInputSchema.safeParse(input)`
- It converts parsed errors into `fieldErrors`
- It calls `setError` on the client to map server response errors back into the form state

This is the clearest current standard in the app.

### 3.2 Validation strategy

Current pattern:

- client validation via Zod schema
- server validation via the same schema on the server action
- client form shows inline error messages and a top-level server alert

This is a good pattern and should be repeated for other future forms.

### 3.3 Default values and updates

Default values are handled in the `useForm` config in [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx):

```ts
useForm<CompanyCreateInput>({
  resolver: zodResolver(companyCreateInputSchema),
  defaultValues: {
    name: "",
    legalName: "",
    countryCode: "",
    registrationNumber: "",
    industry: "",
  },
});
```

Programmatic updates are handled via:

- `useWatch({ control, name: "countryCode" })`
- `useWatch({ control, name: "industry" })`
- `setValue("industry", value)`
- `Controller` for custom controlled components

### 3.4 Submission and server errors

The pattern is:

- `onSubmit(data)` calls the server action
- if the action returns `fieldErrors`, each one is pushed into RHF via `setError`
- if the action returns a generic message, it is displayed as a server-level alert
- `isSubmitting` disables the submit action

This is consistent and should be reused.

### 3.5 Reusability status

This form is not abstracted yet; it is a feature-specific implementation. It works, but it is not reusable across the app.

### 3.6 Other form patterns

Searches across the codebase found no other active `FormProvider`, `useFormContext`, `useController`, or generic reusable form wrappers.

The login screen in [app/(auth)/login/page.tsx](<app/(auth)/login/page.tsx>) is state-based rather than schema-driven form logic, and is not part of the app’s form architecture standard.

---

## 4. Existing UI Components

### 4.1 Low-level primitive components

The app wraps Base UI primitives in [components/ui](components/ui):

- [components/ui/input.tsx](components/ui/input.tsx)
  - Wraps `@base-ui/react/input`
  - Standard text input primitive
  - Forwards refs
  - Supports `placeholder`, `disabled`, `required`, `aria-invalid`, `type`, etc.

- [components/ui/input-text.tsx](components/ui/input-text.tsx)
  - Thin wrapper over `Input`
  - Standard `React.ComponentPropsWithoutRef<"input">`
  - Good for simple text fields

- [components/ui/textarea.tsx](components/ui/textarea.tsx)
  - Styled native textarea
  - Works with `register` directly

- [components/ui/select.tsx](components/ui/select.tsx)
  - Base UI select primitives
  - Low-level building block
  - Not a form field abstraction

- [components/ui/selector.tsx](components/ui/selector.tsx)
  - Controlled custom selector with `value`, `onValueChange`, and option arrays
  - Works best with `Controller`

- [components/ui/country-selector.tsx](components/ui/country-selector.tsx)
  - Controlled custom combobox
  - Also works best with `Controller`

- [components/ui/dialog.tsx](components/ui/dialog.tsx)
  - Dialog primitives around Base UI
  - Good for modal structure

### 4.2 Typography

The app’s typography utilities are in [components/ui/typography.tsx](components/ui/typography.tsx).

This component provides semantic text styling, e.g.:

- `header-*`
- `subtitle`
- `regular`
- `muted`
- `caption`
- `small`

This should be used for headings and helper text, but it is not a form label or field wrapper.

### 4.3 What the project does not have

There is no existing reusable abstraction such as:

- `Label`
- `FormField`
- `FormControl`
- `FormMessage`
- `FormProvider`
- `FieldError`

The current code uses native HTML `<label>` elements with inline error paragraphs, which is fully acceptable and consistent with the project’s current structure.

### 4.4 Recommendation for UI primitives

The existing UI layer is a good foundation and should stay low-level. It should not be replaced with a new UI library or with a large generic abstraction layer.

The right standard is:

- low-level UI primitives stay in [components/ui](components/ui)
- form-aware wrappers are added only for repeated patterns, as needed

---

## 5. Current Form Context and Default Value Handling

### 5.1 Form context status

There is no shared form context pattern in the codebase.

Searches show no `FormProvider` or `useFormContext` usage anywhere in the repo.

The app is currently using direct `useForm` calls inside the form component itself.

### 5.2 Recommended pattern

For a standardized pattern, the app should continue to use `useForm` directly for feature-level forms and only introduce `FormProvider` when there are multiple nested components that need access to the same form instance.

Example direction:

```tsx
const form = useForm({
  defaultValues: {
    email: "",
    role: "VIEWER",
  },
});

<FormProvider {...form}>
  <FormTextInput name="email" label="Email address" />
  <FormRoleSelect name="role" label="Role" />
</FormProvider>;
```

This is a valid pattern, but it is not currently used anywhere in Local CEO.

### 5.3 Default values

The project's established pattern is to set defaults directly in `useForm({ defaultValues })`.

This should remain the primary way to initialize forms.

### 5.4 Async prefilled data

When a form needs to load existing values asynchronously, the proper pattern is `reset(data)` after fetch completes.

This should be preferred over manually setting local state with duplicate form state.

### 5.5 setValue vs reset

- Use `setValue` for individual controlled updates or custom field logic.
- Use `reset` when the whole form shape is replaced or repopulated.
- Avoid mirroring form data in ordinary component local state.

### 5.6 Validation errors in the UI

The current pattern already works well:

- validation issues are attached to RHF field state
- the component reads `errors.name` or `errors.countryCode`
- the UI displays a `role="alert"` message near the field

This should continue as the standard error rendering approach.

### 5.7 Rerender efficiency

The app already avoids unnecessary state duplication by reading selected values with `useWatch` and updating via `setValue` when needed.

This is the correct philosophy to retain.

---

## 6. Gaps and Inconsistencies

The main gaps identified are:

1. There is only one concrete form implementation, and it is feature-specific rather than reusable.
2. No shared RHF-aware form wrapper exists.
3. No reusable input abstraction exists for label + validation + helper text + error handling.
4. The app uses native labels directly instead of a shared `Label` component.
5. No shared form error or helper text pattern exists yet.
6. The app does not currently have a standard for nested field names or strongly typed form inputs.

These are manageable gaps and do not require a major framework switch.

---

## 7. Recommended Form Architecture

The smallest scalable architecture is:

A. Low-level UI primitives

- Keep [components/ui/input.tsx](components/ui/input.tsx)
- Keep [components/ui/textarea.tsx](components/ui/textarea.tsx)
- Keep [components/ui/select.tsx](components/ui/select.tsx)
- Keep [components/ui/dialog.tsx](components/ui/dialog.tsx)

B. RHF-aware wrappers

- Add a minimal layer for repeated patterns like:
  - `FormTextInput`
  - `FormTextarea`
  - `FormSelect`
  - `FormCheckbox`
  - `FormError`

C. Feature-specific forms

- Keep them in the feature area, as with [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx)

D. Validation schemas

- Continue storing Zod schemas in directories like [lib/validations](lib/validations)

E. Server actions

- Keep authoritative validation in server actions like [lib/actions/invitations.ts](lib/actions/invitations.ts)

This avoids a heavy generic framework while still making future forms consistent.

---

## 8. Proposed Component Structure

Minimal proposed structure:

- `components/ui/` — low-level UI primitives (existing)
- `components/form/` — optional form helpers, shared and small
- `features/<feature>/components/` — feature-specific forms
- `lib/validations/` — Zod validation schemas
- `lib/actions/` — server actions with authoritative validation

Suggested responsibilities:

- `FormTextInput`: uses `useFormContext` and renders label + input + error message
- `FormTextarea`: same pattern for multiline text
- `FormSelect`: for controlled select fields, likely with `Controller`
- `FormError`: shared alert/message styling
- `FormField`: shared wrapper for field label and helper text

This is intentionally small and fit for the current application scale.

---

## 9. Invite Member Modal Integration Plan

### Context

The Invite Member modal will be used under `/companies/[slug]/members` and will drive the backend action in [lib/actions/invitations.ts](lib/actions/invitations.ts).

It will include:

- `email`: required, valid email
- `role`: required, based on permissions

The backend rules already exist in:

- [lib/invitations/policy.ts](lib/invitations/policy.ts)
- [lib/auth/rbac.ts](lib/auth/rbac.ts)

### Recommended structure

The form should be a feature-local component near the member management feature.

It should:

- use `useForm`
- create a Zod schema for the invite input
- populate the role select from `getAssignableInvitationRoles(actorRole)`
- call `createInvitationAction()` on submit
- disable the submit button while pending
- display server errors in the form
- reset the form after success
- clear state when the modal is reopened

### Role handling

The allowed roles should come from the authorization logic and not be hardcoded in the client. The existing trusted source is [lib/invitations/policy.ts](lib/invitations/policy.ts).

### Validation

Use the same app pattern:

- validate on the client using Zod
- validate again in the server action
- map field errors back into RHF via `setError`

### Good fit with project conventions

This follows the project’s current pattern in [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx):

- `useForm` at the component level
- `zodResolver`
- form-level alert and field-level validation output
- server action-driven submission

---

## 10. Implementation Steps (in order)

1. Keep the existing dependencies as-is.
2. Add a validation schema for invite fields following [lib/validations/company.ts](lib/validations/company.ts).
3. Add a minimal form-aware wrapper layer only if more than one form needs it.
4. Build the Invite Member modal form using `useForm` and `zodResolver`.
5. Use `Controller` for the role select because it is controlled.
6. Use `register` for the email field.
7. Bind server errors to RHF with `setError`.
8. Reset the form on success and clear stale errors when the modal reopens.
9. Rely on server-side permission checks for final authorization decisions.

---

## 11. Files That Would Need Changes

Existing files relevant to the next form:

- [package.json](package.json) — no changes needed
- [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx) — reference pattern only
- [lib/validations/company.ts](lib/validations/company.ts) — pattern to follow
- [lib/actions/company.ts](lib/actions/company.ts) — example of field error mapping
- [lib/actions/invitations.ts](lib/actions/invitations.ts) — backend contract for the modal submission
- [lib/invitations/policy.ts](lib/invitations/policy.ts) — assignable roles source
- [lib/auth/rbac.ts](lib/auth/rbac.ts) — role and permission model
- [components/ui/input.tsx](components/ui/input.tsx) — low-level input primitive
- [components/ui/select.tsx](components/ui/select.tsx) — low-level select primitive
- [components/ui/textarea.tsx](components/ui/textarea.tsx) — low-level textarea primitive
- [components/ui/dialog.tsx](components/ui/dialog.tsx) — modal primitive to reuse

Additional new files would likely be created for:

- invitation validation schema
- a small shared form helper layer
- the Invite Member modal component itself

---

## 12. Final Recommendation

The app is already positioned correctly for a simple, consistent form pattern:

- `react-hook-form` is installed and already used
- `@hookform/resolvers` is installed and already used
- `zod` is installed and already used
- the project already has a working form example in [features/companies/components/company-form.tsx](features/companies/components/company-form.tsx)
- the repository already has the right server-side validation architecture

The missing piece is not dependencies—it is standardization.

The best recommendation for Local CEO is:

- keep the current dependencies
- keep the low-level Base UI primitives
- add a minimal form-aware wrapper layer only when needed
- use the existing server action patterns as the source of truth
- create the Invite Member modal using the same RHF + Zod conventions as the company creation flow

This gives the project a consistent and scalable standard without introducing additional framework complexity or unnecessary abstraction.
