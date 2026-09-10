import { useState } from "react";
import { useRouter } from "../context";
import { useAuth } from "../context";
import { Button, Input, useToast } from "../components/ui";
import { DoodleRecycle, DoodleStar, DoodleLeaf } from "../components/Doodles";
import { api } from "../api";

// ─── Login Page ───────────────────────────────────────────────────────────────

export function Login() {
  const { navigate } = useRouter();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      login(res.token, res.user);
      navigate("discover");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex">
      {ToastComponent}

      {/* Left panel — illustration */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 dark-section p-12 relative overflow-hidden">
        <div className="absolute top-12 left-12 animate-wiggle"><DoodleStar size={32} color="#e8b84b" /></div>
        <div className="absolute bottom-20 right-12 animate-float"><DoodleLeaf size={32} color="#5a7a4a" /></div>
        <div className="relative z-10 text-center">
          <DoodleRecycle size={80} color="#c4622d" className="mx-auto mb-6 animate-spin-slow" />
          <h2 className="font-display text-4xl font-semibold text-warm-white mb-4">
            Welcome back.
          </h2>
          <p className="text-brown-300 text-lg leading-relaxed max-w-sm">
            Your community of reusers is waiting. Sign in to continue giving things a second life.
          </p>
          {/* Demo hint */}
          <div className="mt-8 bg-warm-white/10 rounded-2xl px-5 py-4 border border-cream-200/20">
            <p className="text-cream-200 text-sm font-semibold mb-2">Demo credentials</p>
            <p className="text-brown-300 text-sm">Email: <span className="text-yellow-400">sara@example.com</span></p>
            <p className="text-brown-300 text-sm">Password: <span className="text-yellow-400">password123</span></p>
            <p className="text-brown-300 text-sm mt-1">Admin: <span className="text-yellow-400">admin@trashit.com</span></p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <button onClick={() => navigate("landing")} className="flex items-center gap-2 mb-8">
            <DoodleRecycle size={28} color="#c4622d" />
            <span className="font-display text-2xl font-semibold text-brown-900">TrashIt</span>
          </button>

          <h1 className="font-display text-3xl font-semibold text-brown-900 mb-1">Sign in</h1>
          <p className="text-brown-400 text-sm mb-8">
            New here?{" "}
            <button onClick={() => navigate("register")} className="text-orange-500 font-semibold hover:underline">
              Create an account
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-brown-600 transition-colors">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              }
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-xl mt-2">
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-cream-200" />
            <span className="text-xs text-brown-300">or continue as</span>
            <div className="flex-1 h-px bg-cream-200" />
          </div>

          <button
            onClick={() => navigate("browse")}
            className="mt-4 w-full py-3 border-2 border-cream-200 text-brown-600 text-sm font-semibold rounded-xl hover:bg-cream-100 transition-colors"
          >
            Browse posts without signing in
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export function Register() {
  const { navigate } = useRouter();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.auth.register(form);
      login(res.token, res.user);
      navigate("discover");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex">
      {ToastComponent}

      {/* Left panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 dark-section p-12 relative overflow-hidden">
        <div className="absolute top-8 right-8 animate-float"><DoodleStar size={28} color="#e8b84b" /></div>
        <div className="absolute bottom-16 left-8 animate-wiggle"><DoodleLeaf size={28} color="#5a7a4a" /></div>
        <div className="text-center z-10 relative">
          <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <DoodleRecycle size={52} color="#c4622d" />
          </div>
          <h2 className="font-display text-4xl font-semibold text-warm-white mb-4">
            Join TrashIt
          </h2>
          <p className="text-brown-300 text-lg leading-relaxed max-w-sm">
            Become part of a community that believes in the value of every material. Your journey starts here.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            {["Buy & Sell", "AI Ideas", "Matches", "Chat"].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-warm-white/10 text-cream-200 text-xs font-semibold rounded-full border border-cream-200/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2 mb-8">
            <DoodleRecycle size={28} color="#c4622d" />
            <span className="font-display text-2xl font-semibold text-brown-900">TrashIt</span>
          </button>

          <h1 className="font-display text-3xl font-semibold text-brown-900 mb-1">Create account</h1>
          <p className="text-brown-400 text-sm mb-8">
            Already a member?{" "}
            <button onClick={() => navigate("login")} className="text-orange-500 font-semibold hover:underline">
              Sign in
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username"
                value={form.username}
                onChange={set("username")}
                error={errors.username}
                placeholder="johndoe"
                autoComplete="username"
                leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
              />
              <Input
                label="Full name"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              hint="At least 6 characters"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-brown-600">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              }
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-xl mt-2">
              Create my account
            </Button>

            <p className="text-xs text-brown-400 text-center">
              By creating an account you agree to our community guidelines. TrashIt is free to use.
            </p>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-cream-200" />
            <span className="text-xs text-brown-300">or</span>
            <div className="flex-1 h-px bg-cream-200" />
          </div>

          <button
            onClick={() => navigate("browse")}
            className="mt-4 w-full py-3 border-2 border-cream-200 text-brown-600 text-sm font-semibold rounded-xl hover:bg-cream-100 transition-colors"
          >
            Browse first, sign up later
          </button>
        </div>
      </div>
    </div>
  );
}
