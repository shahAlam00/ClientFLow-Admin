import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Logo from "../../assets/Logo.png";
import api from "../../lib/axios.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // agar backend token bhejta hai
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--sidebar-background))] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          {/* <div className="inline-flex h-14 w-14 rounded-lg items-center justify-center mb-4">
            <img
              src={Logo}
              alt="Logo"
              className="h-full w-full object-contain rounded-lg"
            />
          </div> */}
          <h1 className="font-serif text-3xl text-sidebar-foreground">
            Admin Console
          </h1>
          <p className="text-sidebar-foreground/60 text-sm mt-1">
             ClientFlow Admin Dashboard
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In to Dashboard"}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Encrypted session · Privileged access only
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-sidebar-foreground/50 mt-6">
          <Link to="/" className="hover:text-gold">
            ← Return to public website
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;