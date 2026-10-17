import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — JobTrack" },
      { name: "description", content: "Log in or create a JobTrack account to track your job applications." },
      { property: "og:title", content: "Sign in — JobTrack" },
      { property: "og:description", content: "Log in or create a JobTrack account." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Please enter a valid email address.");

function AuthPage() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-primary">
          <Briefcase className="h-7 w-7" /> JobTrack
        </div>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login"><LoginForm /></TabsContent>
              <TabsContent value="signup"><SignupForm /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.status && error.status >= 500 ? "Something went wrong. Please try again." : "Invalid email or password.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2">
        <Label htmlFor="le">Email</Label>
        <Input id="le" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lp">Password</Label>
        <Input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setInfo("");
    const errs: Record<string, string> = {};
    const em = emailSchema.safeParse(email);
    if (!em.success) errs.email = em.error.issues[0].message;
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (error.code === "user_already_exists" || msg.includes("already registered")) setFormError("This email is already registered.");
      else if (error.code === "email_address_invalid" || msg.includes("invalid")) setFormError("Please enter a valid email address.");
      else if (error.code === "weak_password") setFormError("Password must be at least 6 characters.");
      else setFormError("Something went wrong. Please try again.");
      return;
    }
    // Supabase returns a user with no identities when the email already exists (with confirmation on).
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setFormError("This email is already registered.");
      return;
    }
    if (data.session) navigate({ to: "/dashboard", replace: true });
    else setInfo("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
      {info && <Alert><AlertDescription>{info}</AlertDescription></Alert>}
      <div className="space-y-2">
        <Label htmlFor="se">Email</Label>
        <Input id="se" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sp">Password</Label>
        <Input id="sp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sc">Confirm password</Label>
        <Input id="sc" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
      </div>
      <Button className="w-full" disabled={loading}>{loading ? "Creating account..." : "Sign up"}</Button>
    </form>
  );
}
