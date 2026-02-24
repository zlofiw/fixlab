interface SectionHeadingProps {
  tag: string
  title: string
  description?: string
  center?: boolean
}

export function SectionHeading({ tag, title, description, center = false }: SectionHeadingProps) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 inline-flex items-center rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 backdrop-blur">
        {tag}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}
