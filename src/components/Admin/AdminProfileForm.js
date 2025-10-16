// Admin/AdminProfileForm.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const input =
  "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200";

/* ----------------------------- UI Subcomponents ---------------------------- */

function EyeIcon({ off = false, className = "h-5 w-5" }) {
  // Minimal, crisp strokes
  return off ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a12.6 12.6 0 0 1-3.05 3.62" />
      <path d="M9.9 14.1a3 3 0 1 0 4-4" />
      <path d="M6.1 6.1A12.08 12.08 0 0 0 1 12s4 8 11 8a10.8 10.8 0 0 0 4.9-1.1" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  inputClass = "",
  autoComplete = "new-password",
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="relative group">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${inputClass} pr-12`} // room for eye button
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 group-focus-within:text-gray-600"
        >
          <EyeIcon off={show} />
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Component -------------------------------- */

export default function AdminProfileForm({ onClose }) {
  const [adminProfile, setAdminProfile] = useState({
    first_name: localStorage.getItem("first_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    email: localStorage.getItem("email") || "",
    profile_picture: localStorage.getItem("profile_picture") || "",
  });

  // ⚠️ Do NOT keep passwords in localStorage.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);

  // Build absolute URL for current server-stored photo (if any)
  const currentPhoto =
    adminProfile.profile_picture &&
    (adminProfile.profile_picture.startsWith("http")
      ? adminProfile.profile_picture
      : `${API_BASE}${
          adminProfile.profile_picture.startsWith("/")
            ? adminProfile.profile_picture
            : `/${adminProfile.profile_picture}`
        }`);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpdate = async (e) => {
    e?.preventDefault?.();
    setError("");

    const id = localStorage.getItem("user_id");
    if (!id) {
      setError("Missing user session. Please log in again.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("first_name", adminProfile.first_name.trim());
      formData.append("last_name", adminProfile.last_name.trim());
      formData.append("email", adminProfile.email.trim());
      if (password.trim()) formData.append("password", password.trim());
      if (file) formData.append("profile_picture", file);

      const { data } = await axios.put(
        `${API_BASE}/api/profile/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Persist locally for navbar, etc.
      localStorage.setItem("first_name", adminProfile.first_name.trim());
      localStorage.setItem("last_name", adminProfile.last_name.trim());
      localStorage.setItem("email", adminProfile.email.trim());
      if (data?.profile_picture) {
        localStorage.setItem("profile_picture", data.profile_picture);
      }

      setPassword("");
      setConfirmPassword("");
      setFile(null);
      onClose?.();
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err?.response?.data?.message ||
          "Update failed. Please try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="mx-auto space-y-6 rounded-2xl bg-white p-6 text-sm text-gray-800 shadow-md"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-emerald-700">Edit Profile</h2>
      </div>
      <div className="h-px w-full bg-emerald-100" />

      {/* Avatar + Change */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={preview || currentPhoto || "/default-avatar.png"}
            alt="Profile"
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow ring-2 ring-emerald-200"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow transition hover:bg-emerald-700"
          >
            Change
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <p className="text-xs text-gray-500">
          JPG/PNG up to ~2&nbsp;MB works best.
        </p>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            First Name
          </label>
          <input
            type="text"
            value={adminProfile.first_name}
            onChange={(e) =>
              setAdminProfile((p) => ({ ...p, first_name: e.target.value }))
            }
            className={input}
            placeholder="First name"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Last Name
          </label>
          <input
            type="text"
            value={adminProfile.last_name}
            onChange={(e) =>
              setAdminProfile((p) => ({ ...p, last_name: e.target.value }))
            }
            className={input}
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Email
        </label>
        <input
          type="email"
          value={adminProfile.email}
          onChange={(e) =>
            setAdminProfile((p) => ({ ...p, email: e.target.value }))
          }
          className={`${input} bg-gray-50`}
          placeholder="Email address"
          disabled
        />
        <p className="mt-1 text-xs text-gray-500">
          Email is fixed. Contact support to change.
        </p>
      </div>

      {/* Passwords (with eye toggles) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          inputClass={input}
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          inputClass={input}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-70"
        >
          {saving ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8v4"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              Saving…
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
