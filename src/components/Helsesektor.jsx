import { trackEvent } from '../lib/analytics'
import useContent from '../hooks/useContent'
import EditableText from './editable/EditableText'
import EditableImage from './editable/EditableImage'
import InlineRichText from './editable/InlineRichText'
import RuleGrid from './ui/RuleGrid'
import { IMAGES, img } from '../assets/images'

function InlineEditableParagraph({
  path,
  value,
  className,
  linkClassName,
  as = 'p',
  ...rest
}) {
  return (
    <InlineRichText
      as={as}
      value={value}
      className={className}
      linkClassName={linkClassName}
      data-content-path={path}
      {...rest}
    />
  )
}

/**
 * Helsesektor — la presentación del área sanitaria.
 *
 * Antes: dos columnas con la imagen dentro de un `rounded-3xl shadow-2xl` y un
 * degradado encima que la ensuciaba sin motivo, más un botón azul con sombra.
 * Y, sobre todo, se tiraban a la basura los datos que este lector SÍ quiere:
 * `stats` y `groupsValue` existen en el contenido y no se pintaban en ninguna
 * parte. 25 000 horas de clase y 17–20 grupos al año responden a la única
 * pregunta del responsable de personal: «¿esto es serio o es una agencia más?».
 *
 * Ahora la sección termina en una tira de datos con filetes, igual que el hero:
 * las cifras se comparan entre sí, que es para lo que están.
 */
function Metric({ metric }) {
  return (
    <RuleGrid.Cell className="px-5 py-7 sm:px-6 lg:px-8">
      <EditableText
        as="div"
        path={metric.valuePath}
        value={metric.value}
        className="font-heading text-[1.625rem] lg:text-[2rem] font-semibold text-navy tabular-nums tracking-[-0.03em] leading-none"
      />
      <EditableText
        as="div"
        path={metric.labelPath}
        value={metric.label}
        className="mt-2.5 font-ui text-[0.875rem] text-ink-muted leading-snug"
      />
    </RuleGrid.Cell>
  )
}

export default function Helsesektor() {
  const c = useContent('helsesektorComp')

  const metrics = [
    ...(c.stats || []).map((s, i) => ({
      value: s.value,
      label: s.label,
      valuePath: `helsesektorComp.stats.${i}.value`,
      labelPath: `helsesektorComp.stats.${i}.label`,
    })),
    ...(c.groupsValue
      ? [{
          value: c.groupsValue,
          label: c.groupsLabel,
          valuePath: 'helsesektorComp.groupsValue',
          labelPath: 'helsesektorComp.groupsLabel',
        }]
      : []),
  ]

  return (
    <section
      id="helsesektor"
      className="scroll-mt-28 bg-surface"
      aria-labelledby="helsesektor-heading"
    >
      <div className="container-xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          <div className="lg:col-span-5 order-2 lg:order-1 pb-16 lg:py-24">
            <EditableImage
              path="helsesektorComp.imageUrl"
              src={img(c.imageUrl || IMAGES.enfermeria, 1200)}
              alt={c.imageAlt || 'Helsepersonell i opplæring gjennom Global Working'}
              className="w-full h-[300px] sm:h-[400px] lg:h-[520px] object-cover rounded-panel"
              loading="lazy"
              width="640"
              height="520"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2 pt-20 lg:py-24">
            <EditableText
              as="span"
              path="helsesektorComp.label"
              value={c.label}
              className="gw-label text-primary-600"
            />
            <EditableText
              id="helsesektor-heading"
              as="h2"
              path="helsesektorComp.heading"
              value={c.heading}
              className="mt-5 text-display-sm font-semibold text-navy"
            />
            <InlineEditableParagraph
              as="p"
              path="helsesektorComp.description"
              value={c.description}
              className="mt-6 gw-measure !text-ink-muted text-body leading-[1.65]"
            />

            <a
              href="/kontakt"
              onClick={() => trackEvent('cta_click', { location: 'helsesektor', cta: 'be_om_kandidater' })}
              className="gw-btn gw-btn-ink mt-9"
            >
              <EditableText as="span" path="helsesektorComp.ctaLabel" value={c.ctaLabel} className="inline" />
              <svg
                width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      {metrics.length > 0 && (
        <div className="border-t border-line">
          <div className="container-xl">
            <RuleGrid cols="base2-lg4">
              {metrics.map((metric, i) => (
                <Metric key={`${metric.labelPath}-${i}`} metric={metric} />
              ))}
            </RuleGrid>
          </div>
        </div>
      )}
    </section>
  )
}
