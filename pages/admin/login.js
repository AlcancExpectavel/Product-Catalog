import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Head from "next/head";
import BrandIcon from "../../components/BrandIcon";

const BRAND_NAME = "Alcance Expectável";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/admin");
    });
    return unsub;
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (adminEmail && email !== adminEmail) {
      setErro("Acesso não autorizado.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      setErro("Email ou palavra-passe incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | {BRAND_NAME}</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BrandIcon size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Área de Administração</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{BRAND_NAME}</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@empresa.com"
                />
              </div>
              <div>
                <label className="label">Palavra-passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {erro && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
                  {erro}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
