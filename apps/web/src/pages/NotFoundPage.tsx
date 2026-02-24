import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center py-12">
      <div className="panel w-full max-w-2xl rounded-[1.8rem] p-8 text-center md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          Такой страницы нет в маршрутах FixLab
        </h1>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
          Возможно, ссылка устарела или страница была перенесена. Вернитесь на главную или откройте страницу трекинга заявки.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-2xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,38,58,0.22)]"
          >
            На главную
          </Link>
          <Link
            to="/track"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Открыть трекинг
          </Link>
        </div>
      </div>
    </div>
  )
}
