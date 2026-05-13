import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, setAdminToken } from "@/lib/api";

const AdminLogin = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? "/panel";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch<{ token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ user, pass }),
      });
      setAdminToken(response.token);
      toast.success("Bienvenido, administrador");
      navigate(from, { replace: true });
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "No se pudo iniciar sesion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </span>
          <Badge className="mb-2 bg-secondary text-secondary-foreground hover:bg-secondary">
            Acceso restringido
          </Badge>
          <h1 className="text-2xl font-extrabold">Panel interno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo personal autorizado.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            <Input
              id="user"
              autoFocus
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Contraseña</Label>
            <Input
              id="pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            <Lock className="mr-2 h-4 w-4" />
            {submitting ? "Ingresando..." : "Iniciar sesion"}
          </Button>
        </form>

      </Card>
    </section>
  );
};

export default AdminLogin;
