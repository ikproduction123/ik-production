import { Link } from "react-router-dom";

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Digital Invitation SaaS
        </p>

        <h1 className="text-4xl font-bold text-gray-900">
          IK-PRO.MY.ID
        </h1>

        <p className="mt-4 text-gray-600">
          Platform Undangan Digital Profesional
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Masuk
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}

export default App;
