import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { formatRut, isValidRut, formatPhoneLocal, cleanPhone } from "@/lib/format";
import { UserPlus, LogIn, Wrench, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [submitting, setSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (await signIn(loginEmail, loginPass)) {
        navigate(from, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidRut(rut)) {
      toast.error("RUT invalido");
      return;
    }
    if (cleanPhone(phone).length !== 8) {
      toast.error("Telefono debe tener 8 digitos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await signUp({
        firstName,
        lastName,
        email,
        password,
        rut: formatRut(rut),
        phone: cleanPhone(phone),
      });
      if (ok) navigate(from, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-glow">
            <Wrench className="h-7 w-7 text-primary-foreground" />
          </span>
          <h1 className="text-2xl font-extrabold">Mi cuenta FERREMAS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesion o crea tu cuenta para comprar.
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesion</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={onLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lemail">Email</Label>
                <Input
                  id="lemail"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@email.cl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lpass">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="lpass"
                    type={showLoginPass ? "text" : "password"}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((value) => !value)}
                    aria-label={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <LogIn className="mr-2 h-4 w-4" />
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <form onSubmit={onRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">Nombre</Label>
                  <Input id="fn" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">Apellido</Label>
                  <Input id="ln" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.cl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  required
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  placeholder="12.345.678-9"
                  inputMode="text"
                  autoCapitalize="characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono movil</Label>
                <div className="flex">
                  <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                    +569
                  </span>
                  <Input
                    id="phone"
                    required
                    value={formatPhoneLocal(phone)}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="1234 5678"
                    className="rounded-l-none"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="pass"
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((value) => !value)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <UserPlus className="mr-2 h-4 w-4" />
                {submitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Eres parte del equipo?{" "}
          <Link to="/admin" className="text-primary hover:underline">
            Acceso interno
          </Link>
        </p>
      </Card>
    </section>
  );
};

export default Auth;
