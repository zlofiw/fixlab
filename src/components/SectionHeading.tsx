interface SectionHeadingProps {
  tag: string
  title: string
  description: string
  center?: boolean
}

export function SectionHeading({
  tag,
  title,
  description,
  center = false,
}: SectionHeadingProps) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold tracking-wide text-cyan-900">
        {tag}
      </p>
      <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
      <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  )
}
