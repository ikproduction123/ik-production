import { Helmet } from "react-helmet-async";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>IK-PRO.MY.ID — Undangan Digital</title>

        <meta
          name="description"
          content="Platform undangan digital profesional IK-PRO.MY.ID."
        />
      </Helmet>

      <main className="min-h-screen bg-[#FFF8E7]">
        <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20">
          <div className="max-w-3xl">

            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
              IK-PRO.MY.ID
            </p>

            <h1 className="text-4xl font-bold leading-tight text-[#111827] sm:text-5xl lg:text-6xl">
              Undangan Digital Profesional untuk Momen Spesial Anda
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Buat, kelola, dan bagikan undangan digital dengan mudah
              melalui platform IK-PRO.MY.ID.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-xl bg-[#D97706] px-6 py-3 font-semibold text-white transition hover:bg-[#b45309]"
              >
                Daftar Sekarang
              </button>

              <button
                type="button"
                className="rounded-xl border border-[#111827] px-6 py-3 font-semibold text-[#111827] transition hover:bg-[#111827] hover:text-white"
              >
                Lihat Tema
              </button>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
