"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAnalytics } from "@/hooks/use-analytics";
import type {
  HelpOutFormByRolePayload,
  HelpOutFormPicklistsPayload,
} from "@/lib/convex-server";

interface FormData {
  twitterHandle: string;
  discordUsername: string;
  discordUserId: string;
  hasPoliticalExperience: boolean;
  region: string;
  state: string;
  county: string;
  city: string;
  zipCode: string;
  email: string;
  phoneNumber: string;
  name: string;
  nickname: string;
  helpWith: string;
}

interface FormErrors {
  [key: string]: string;
}

const DEFAULT_LABELS: Record<keyof FormData, string> = {
  twitterHandle: "Twitter Handle",
  discordUsername: "Discord Username",
  discordUserId: "Discord User ID",
  hasPoliticalExperience:
    "Have you been part of a political campaign or committee before?",
  region: "Region",
  state: "State",
  county: "County",
  city: "City",
  zipCode: "ZIP Code",
  email: "Email",
  phoneNumber: "Phone Number",
  name: "Full Name",
  nickname: "Preferred Nickname",
  helpWith: "How Would You Like to Help?",
};

function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function validateField(key: string, value: string | boolean): string | null {
  if (typeof value === "boolean") return null;

  const cleaned = sanitizeInput(value);

  switch (key) {
    case "twitterHandle":
      if (cleaned && !/^@?[\w]{1,15}$/.test(cleaned)) {
        return "Invalid Twitter handle format";
      }
      break;
    case "discordUsername":
      if (cleaned && !/^.{2,32}(#\d{4})?$/.test(cleaned)) {
        return "Invalid Discord username";
      }
      break;
    case "discordUserId":
      if (cleaned && !/^\d{17,19}$/.test(cleaned)) {
        return "Invalid Discord user ID (must be 17-19 digits)";
      }
      break;
    case "zipCode":
      if (!/^\d{5}(-\d{4})?$/.test(cleaned)) {
        return "Invalid ZIP code";
      }
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
        return "Invalid email format";
      }
      break;
    case "phoneNumber":
      if (cleaned) {
        const digits = cleaned.replace(/\D/g, "");
        if (!/^1?\d{10}$/.test(digits)) {
          return "Invalid phone number";
        }
      }
      break;
    case "name":
      if (cleaned.length < 2 || cleaned.length > 100) {
        return "Name must be 2-100 characters";
      }
      break;
    case "nickname":
      if (cleaned.length > 50) {
        return "Nickname must be 50 characters or fewer";
      }
      break;
    case "helpWith": {
      const words = cleaned.split(/\s+/).filter(Boolean).length;
      if (words < 10) {
        return "Please provide at least 10 words";
      }
      if (words > 500) {
        return "Response must be 500 words or fewer";
      }
      break;
    }
  }
  return null;
}

export function HelpOutFormClient({
  roleSlug,
  initialForm = null,
  initialPicklists,
}: {
  roleSlug: string;
  initialForm?: HelpOutFormByRolePayload | null;
  initialPicklists: HelpOutFormPicklistsPayload;
}) {
  const formMetaQ = useQuery(api.helpOut.getFormByRole, { roleSlug });
  const picklistsQ = useQuery(api.helpOut.getFormPicklists);
  const formMeta =
    formMetaQ !== undefined
      ? formMetaQ
      : initialForm !== null && initialForm !== undefined
        ? initialForm
        : undefined;
  const picklists = picklistsQ !== undefined ? picklistsQ : initialPicklists;
  const { track } = useAnalytics();
  const hasStartedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const [formData, setFormData] = useState<FormData>({
    twitterHandle: "",
    discordUsername: "",
    discordUserId: "",
    hasPoliticalExperience: false,
    region: "",
    state: "",
    county: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
    name: "",
    nickname: "",
    helpWith: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [submitError, setSubmitError] = useState("");

  const submit = useMutation(api.helpOut.submitHelpOutForm);

  // Form abandonment detection
  useEffect(() => {
    function onHide() {
      if (hasStartedRef.current && !hasSubmittedRef.current) {
        track("form_abandon", { role: roleSlug });
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") onHide();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [track, roleSlug]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      track("form_start", { role: roleSlug });
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const required: (keyof FormData)[] = [
      "zipCode",
      "email",
      "name",
      "helpWith",
    ];

    for (const field of required) {
      const value = formData[field];
      if (typeof value === "string" && !value.trim()) {
        newErrors[field] = "This field is required";
      }
    }

    for (const key of Object.keys(formData) as (keyof FormData)[]) {
      const value = formData[key];
      if (typeof value === "string" && value.trim()) {
        const error = validateField(key, value);
        if (error) newErrors[key] = error;
      }
    }

    setErrors(newErrors);
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      track("form_validation_error", { role: roleSlug, fields: errorFields });
    }
    return errorFields.length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    track("form_submit_attempt", { role: roleSlug });

    if (!validateForm()) {
      return;
    }

    setStatus("sending");

    try {
      await submit({
        roleSlug,
        twitterHandle: formData.twitterHandle || undefined,
        discordUsername: formData.discordUsername || undefined,
        discordUserId: formData.discordUserId || undefined,
        hasPoliticalExperience: formData.hasPoliticalExperience,
        region: formData.region || undefined,
        state: formData.state || undefined,
        county: formData.county || undefined,
        city: formData.city || undefined,
        zipCode: formData.zipCode,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        name: formData.name,
        nickname: formData.nickname || undefined,
        helpWith: formData.helpWith,
      });
      hasSubmittedRef.current = true;
      track("form_submit_success", { role: roleSlug });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Submission failed";
      track("form_submit_error", { role: roleSlug, error: message });
      setSubmitError(message);
    }
  };

  if (formMeta === undefined || picklists === undefined) {
    return (
      <div className="animate-pulse space-y-4 rounded-lg border p-6 text-sm text-muted-foreground">
        Loading form…
      </div>
    );
  }

  if (formMeta === null) {
    return (
      <p className="text-destructive text-sm" role="alert">
        This role is not available or has been unpublished.
      </p>
    );
  }

  const regions = picklists.regions;
  const states = picklists.states;

  if (status === "done") {
    return (
      <div className="rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-semibold">Thank You!</h2>
        <p className="mt-2 text-muted-foreground">
          Your application has been submitted. We&apos;ll be in touch soon.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setStatus("idle");
            setFormData({
              twitterHandle: "",
              discordUsername: "",
              discordUserId: "",
              hasPoliticalExperience: false,
              region: "",
              state: "",
              county: "",
              city: "",
              zipCode: "",
              email: "",
              phoneNumber: "",
              name: "",
              nickname: "",
              helpWith: "",
            });
          }}
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="font-semibold">{formMeta.title} Requirements</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          {formMeta.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="twitterHandle" className="text-sm font-medium">
            {DEFAULT_LABELS.twitterHandle}
          </label>
          <input
            id="twitterHandle"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="@yourhandle"
            value={formData.twitterHandle}
            onChange={(e) => updateField("twitterHandle", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="discordUsername" className="text-sm font-medium">
            {DEFAULT_LABELS.discordUsername}
          </label>
          <input
            id="discordUsername"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="username#0000"
            value={formData.discordUsername}
            onChange={(e) => updateField("discordUsername", e.target.value)}
          />
          {errors.discordUsername && (
            <p className="text-destructive text-xs">{errors.discordUsername}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="discordUserId" className="text-sm font-medium">
            {DEFAULT_LABELS.discordUserId}
          </label>
          <input
            id="discordUserId"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="123456789012345678"
            value={formData.discordUserId}
            onChange={(e) => updateField("discordUserId", e.target.value)}
          />
          {errors.discordUserId && (
            <p className="text-destructive text-xs">{errors.discordUserId}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={formData.hasPoliticalExperience}
              onChange={(e) =>
                updateField("hasPoliticalExperience", e.target.checked)
              }
            />
            {DEFAULT_LABELS.hasPoliticalExperience}
          </label>
          {errors.hasPoliticalExperience && (
            <p className="text-destructive text-xs">
              {errors.hasPoliticalExperience}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="region" className="text-sm font-medium">
              {DEFAULT_LABELS.region}
            </label>
            <select
              id="region"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.region}
              onChange={(e) => updateField("region", e.target.value)}
            >
              <option value="">Select region</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="state" className="text-sm font-medium">
              {DEFAULT_LABELS.state}
            </label>
            <select
              id="state"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
            >
              <option value="">Select state</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="county" className="text-sm font-medium">
              {DEFAULT_LABELS.county}
            </label>
            <input
              id="county"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.county}
              onChange={(e) => updateField("county", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="city" className="text-sm font-medium">
              {DEFAULT_LABELS.city}
            </label>
            <input
              id="city"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="zipCode" className="text-sm font-medium">
              {DEFAULT_LABELS.zipCode}{" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              id="zipCode"
              type="text"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="12345"
              value={formData.zipCode}
              onChange={(e) => updateField("zipCode", e.target.value)}
            />
            {errors.zipCode && (
              <p className="text-destructive text-xs">{errors.zipCode}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            {DEFAULT_LABELS.email} <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            {DEFAULT_LABELS.phoneNumber}
          </label>
          <input
            id="phoneNumber"
            type="tel"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="555-555-5555"
            value={formData.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
          />
          {errors.phoneNumber && (
            <p className="text-destructive text-xs">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {DEFAULT_LABELS.name} <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="nickname" className="text-sm font-medium">
            {DEFAULT_LABELS.nickname}
          </label>
          <input
            id="nickname"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Johnny"
            value={formData.nickname}
            onChange={(e) => updateField("nickname", e.target.value)}
          />
          {errors.nickname && (
            <p className="text-destructive text-xs">{errors.nickname}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="helpWith" className="text-sm font-medium">
            {DEFAULT_LABELS.helpWith}{" "}
            <span className="text-destructive">*</span>
          </label>
          <textarea
            id="helpWith"
            required
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Tell us about your skills and how you want to contribute..."
            value={formData.helpWith}
            onChange={(e) => updateField("helpWith", e.target.value)}
          />
          {errors.helpWith && (
            <p className="text-destructive text-xs">{errors.helpWith}</p>
          )}
        </div>
      </div>

      {submitError && (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
