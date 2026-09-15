import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button, Input, Textarea, Modal, useToast, Avatar } from "../components/ui";
import { api } from "../api";
import type { User } from "../types";

export default function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const { navigate } = useRouter();
  const { showToast, ToastComponent } = useToast();

  const [tab, setTab] = useState<"profile" | "password" | "danger">("profile");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [deletePassword, setDeletePassword] = useState("");

  // Keep the edit form in sync with the authenticated user's real data.
  // Skipped while editing so in-progress input is never overwritten.
  useEffect(() => {
    if (editMode) return;
    setProfileForm({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
    });
  }, [user?.name, user?.username, user?.email, user?.bio, user?.location, editMode]);

  function setProfileField(k: keyof typeof profileForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfileForm(f => ({ ...f, [k]: e.target.value }));
  }

  function setPwField(k: keyof typeof pwForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPwForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function saveProfile() {
    if (!token) return;

    // Client-side validation mirroring the backend rules
    const errs: Record<string, string> = {};
    const username = profileForm.username.trim().toLowerCase();
    const email = profileForm.email.trim();
    if (username.length < 3 || username.length > 30) errs.username = "Username must be 3-30 characters";
    else if (!/^[a-z0-9_]+$/.test(username)) errs.username = "Only letters, numbers, and underscores";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Please enter a valid email";
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileErrors({});

    setLoading(true);
    try {
      const res = await api.profile.update(
        { ...profileForm, username, email: email.toLowerCase() },
        token
      );
      // Merge the response into the existing user so fields the backend does
      // not return (or that the user did not touch) are preserved.
      updateUser(user ? { ...user, ...res.user } : (res.user as User));
      setEditMode(false);
      showToast("Profile updated!", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    const errs: Record<string, string> = {};
    if (!pwForm.currentPassword) errs.current = "Current password is required";
    if (pwForm.newPassword.length < 6) errs.new = "At least 6 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    if (!token) return;

    setLoading(true);
    try {
      await api.profile.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, token);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
      showToast("Password changed successfully!", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (!token) return;
    try {
      await api.profile.delete(deletePassword, token);
      logout();
      navigate("landing");
      showToast("Account deleted.", "info");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete account", "error");
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {ToastComponent}

      {/* Profile header */}
      <div className="bg-gradient-to-br from-brown-800 to-brown-900 rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" className="ring-4 ring-warm-white/20" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-warm-white">{user.name}</h1>
            <p className="text-brown-300 text-sm">@{user.username}</p>
            {user.bio && <p className="text-brown-300 text-sm mt-1 max-w-xs">{user.bio}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-brown-400">
              {user.location && (
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {user.location}
                </span>
              )}
              {user.role === "admin" && (
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full font-semibold">Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 p-1 rounded-xl mb-6">
        {(["profile", "password", "danger"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? "bg-warm-white text-brown-800 shadow-sm" : "text-brown-500 hover:text-brown-700"
            }`}
          >
            {t === "danger" ? "Account" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="bg-warm-white rounded-2xl border border-cream-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brown-800">Profile information</h2>
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </Button>
            ) : null}
          </div>

          {editMode ? (
            <>
              <Input label="Full name" value={profileForm.name} onChange={setProfileField("name")} error={profileErrors.name} />
              <Input label="Username" value={profileForm.username} onChange={(e) => setProfileForm(f => ({ ...f, username: e.target.value }))} error={profileErrors.username} placeholder="johndoe" autoComplete="username" leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} />
              <Input label="Email address" type="email" value={profileForm.email} onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))} error={profileErrors.email} placeholder="you@example.com" autoComplete="email" leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>} />
              <Textarea label="Bio" value={profileForm.bio} onChange={setProfileField("bio")} placeholder="Tell the community about yourself..." rows={3} />
              <Input label="Location" value={profileForm.location} onChange={setProfileField("location")} placeholder="City or neighborhood" leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>} />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { setEditMode(false); setProfileErrors({}); setProfileForm({ name: user.name, username: user.username, email: user.email, bio: user.bio || "", location: user.location || "" }); }} className="flex-1">Cancel</Button>
                <Button variant="primary" onClick={saveProfile} loading={loading} className="flex-1">Save changes</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-brown-400 font-medium uppercase tracking-wide">Full name</label>
                <p className="text-brown-800 font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-xs text-brown-400 font-medium uppercase tracking-wide">Username</label>
                <p className="text-brown-800 font-medium mt-1">@{user.username}</p>
              </div>
              <div>
                <label className="text-xs text-brown-400 font-medium uppercase tracking-wide">Email</label>
                <p className="text-brown-800 font-medium mt-1">{user.email}</p>
              </div>
              {user.bio && (
                <div>
                  <label className="text-xs text-brown-400 font-medium uppercase tracking-wide">Bio</label>
                  <p className="text-brown-800 mt-1">{user.bio}</p>
                </div>
              )}
              {user.location && (
                <div>
                  <label className="text-xs text-brown-400 font-medium uppercase tracking-wide">Location</label>
                  <p className="text-brown-800 font-medium mt-1">{user.location}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Password tab */}
      {tab === "password" && (
        <div className="bg-warm-white rounded-2xl border border-cream-200 p-6 space-y-4">
          <h2 className="font-semibold text-brown-800">Change password</h2>

          <Input label="Current password" type="password" value={pwForm.currentPassword} onChange={setPwField("currentPassword")} error={pwErrors.current} placeholder="Enter current password" />
          <Input label="New password" type="password" value={pwForm.newPassword} onChange={setPwField("newPassword")} error={pwErrors.new} placeholder="At least 6 characters" />
          <Input label="Confirm new password" type="password" value={pwForm.confirmPassword} onChange={setPwField("confirmPassword")} error={pwErrors.confirm} placeholder="Repeat new password" />
          <Button variant="primary" onClick={changePassword} loading={loading} className="w-full">Update password</Button>
        </div>
      )}

      {/* Account/danger tab */}
      {tab === "danger" && (
        <div className="space-y-4">
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6">
            <h2 className="font-semibold text-brown-800 mb-1">Account details</h2>
            <p className="text-sm text-brown-400">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-ET", { month: "long", year: "numeric" }) : "recently"}</p>
          </div>

          <div className="bg-red-400/5 rounded-2xl border border-red-400/20 p-6">
            <h2 className="font-semibold text-red-400 mb-2">Delete account</h2>
            <p className="text-sm text-brown-500 mb-4">This permanently deletes your account, posts, messages, and all data. This cannot be undone.</p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete my account</Button>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <div className="space-y-4">
          <p className="text-sm text-brown-500">Enter your password to confirm you want to permanently delete your account.</p>
          <Input type="password" label="Password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your password" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={deleteAccount} className="flex-1">Delete forever</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
