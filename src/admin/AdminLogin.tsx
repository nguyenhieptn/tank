import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/api";
import { Shield, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/image.png";

export const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin(username, password);
      localStorage.setItem("tank_admin_token", res.token);
      localStorage.setItem("tank_admin_user", res.username);
      navigate("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tên đăng nhập hoặc mật khẩu không chính xác.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Camo / Tactical grid */}
      <div className="absolute inset-0 pattern-tactical opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-card border-2 border-accent/40 rounded-xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-destructive/10 border border-destructive/20 mb-3 shadow-gold">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-full object-cover" />
          </div>
          <div className="text-xs uppercase tracking-widest text-destructive font-bold">
            Bộ Quốc Phòng — Binh chủng Tăng thiết giáp
          </div>
          <h1 className="font-display text-2xl font-bold text-primary mt-1">
            HỆ THỐNG QUẢN TRỊ NỘI DUNG
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Cổng Thông tin Điện tử Trường Sĩ quan Tăng thiết giáp
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2.5 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Tài khoản quản trị viên
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Mật khẩu bảo mật
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-primary font-bold uppercase tracking-wider h-11 text-xs shadow-gold hover:opacity-95 transition-all mt-2"
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập Quản Trị"}
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-border/60 text-center">
          <a
            href="/siquantank/"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Quay về Trang chủ Cổng thông tin
          </a>
        </div>
      </div>
    </div>
  );
};
