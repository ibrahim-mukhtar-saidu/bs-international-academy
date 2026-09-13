import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-xl font-bold text-white">
              BS
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              BS INTERNATIONAL ACADEMY
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              School Management Portal
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your account details to continue.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-slate-400">
            Authorized users only.
          </p>
        </div>
      </div>
    </main>
  );
}
