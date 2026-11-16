import { IMAGES, img } from '../assets/images'
import OmOss from '../components/OmOss'
import FAQ from '../components/FAQ'
import PageEndNav from '../components/PageEndNav'
import useContent from '../hooks/useContent'
import EditableText from '../components/editable/EditableText'
import EditableImage from '../components/editable/EditableImage'
import InlineRichText from '../components/editable/InlineRichText'
const miriamPhoto = IMAGES.contactMiriam
const groPhoto = IMAGES.contactGro

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
 * Ficha de equipo.
 *
 * Antes: avatar de 96 px con `ring-4` azul dentro de una tarjeta blanca con
 * `shadow-sm hover:shadow-md`, todo centrado. Cuatro medallones idénticos.
 *
 * Si la promesa de la empresa es «detrás hay personas», la persona tiene que
 * verse: retrato vertical a toda la columna, nombre y rol debajo. Sin caja.
 */
function TeamMember({ member, index, basePath }) {
  const normalizedName = (member.name || '').toLowerCase()
  let portrait = member.imageUrl || null

  if (!portrait && normalizedName.includes('miriam')) portrait = miriamPhoto
  else if (!portrait && normalizedName.includes('gro')) portrait = groPhoto
  else if (!portrait && member.hasImage) portrait = IMAGES.ceoPhoto

  return (
    <div>
      {portrait ? (
        <img
          src={portrait}
          alt={member.imageAlt || member.name}
          className="w-full aspect-[4/5] object-cover object-top rounded-panel bg-frost"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full aspect-[4/5] rounded-panel bg-navy flex items-center justify-center">
          <span className="font-heading text-3xl font-semibold text-white">
            {member.initials}
          </span>
        </div>
      )}

      <EditableText
        as="h3"
        path={`${basePath}.${index}.name`}
        value={member.name}
        className="mt-4 font-heading text-body font-semibold text-navy leading-snug"
      />
      <EditableText
        as="p"
        path={`${basePath}.${index}.role`}
        value={member.role}
        className="mt-1 font-ui text-[0.8125rem] text-ink-soft leading-snug"
      />
    </div>
  )
}

export default function OmOssPage() {
  const hero = useContent('omOssHero')
  const teamSection = useContent('omOssTeam')
  const offices = useContent('omOssOffices')

  return (
    <>
      {/* ── Cabecera de página ───────────────────────────────────────────
          Banda navy sólida, sin mancha radial. La migaja en Poppins: es
          navegación, no lectura. */}
      <section className="bg-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-xl">
          <nav className="font-ui text-[0.8125rem] text-primary-200 mb-7" aria-label="Brødsmuler">
            <a href="/" className="transition-colors hover:text-white">Hjem</a>
            <span className="mx-2 text-primary-300/70" aria-hidden="true">/</span>
            <span className="text-white">{hero.breadcrumb}</span>
          </nav>

          <EditableText
            as="h1"
            path="omOssHero.h1"
            value={hero.h1}
            className="text-display font-semibold !text-white"
          />
          <InlineEditableParagraph
            as="p"
            path="omOssHero.description"
            value={hero.description}
            className="mt-6 gw-measure !text-primary-100 text-body lg:text-[1.1875rem] !leading-[1.6]"
            linkClassName="!text-white underline decoration-primary-400 underline-offset-4 transition-colors hover:!decoration-white"
          />
        </div>
      </section>

      <OmOss />

      {/* ── Equipo ───────────────────────────────────────────────────────
          Cabecera a dos columnas: el texto largo centrado en serif obliga al
          ojo a buscar el arranque de cada línea. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="om-oss-team-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 lg:mb-14">
            <div className="lg:col-span-6">
              <EditableText
                as="span"
                path="omOssTeam.label"
                value={teamSection.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="om-oss-team-heading"
                path="omOssTeam.heading"
                value={teamSection.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <InlineEditableParagraph
                as="p"
                path="omOssTeam.description"
                value={teamSection.description}
                className="!text-ink-muted text-body !leading-[1.65]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {(teamSection.members || []).map((member, i) => (
              <TeamMember
                key={member.name}
                member={member}
                index={i}
                basePath="omOssTeam.members"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── El vídeo del despacho ────────────────────────────────────────
          El vertical de 9:16 vivía centrado dentro de una caja con
          `shadow-lg`. Ahora es una columna más de la retícula. */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="om-oss-video-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <h2
                id="om-oss-video-heading"
                className="text-display-sm font-semibold text-navy"
              >
                {teamSection.videoHeading || 'Møt teamet i Global Working'}
              </h2>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <div
                className="relative rounded-panel overflow-hidden bg-navy mx-auto lg:mx-0"
                style={{ width: 'min(340px, 100%)', aspectRatio: '9/16' }}
              >
                <iframe
                  src="https://www.youtube.com/embed/KC5OgaAj_VM"
                  title="Møt teamet i Global Working"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sedes ────────────────────────────────────────────────────────
          Antes: `rounded-3xl`, `shadow-2xl` y un degradado navy encima de la
          foto para poder escribir la dirección. La dirección es un dato: va
          en texto, con filete, y la foto se ve entera. */}
      <section
        className="bg-surface overflow-hidden"
        aria-labelledby="om-oss-offices-heading"
      >
        <div className="container-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 pt-20 lg:py-28">
              <EditableText
                as="span"
                path="omOssOffices.label"
                value={offices.label}
                className="gw-label text-primary-600"
              />
              <EditableText
                as="h2"
                id="om-oss-offices-heading"
                path="omOssOffices.heading"
                value={offices.heading}
                className="mt-5 text-display-sm font-semibold text-navy"
              />
              <InlineEditableParagraph
                as="p"
                path="omOssOffices.description"
                value={offices.description}
                className="mt-6 !text-ink-muted text-body !leading-[1.65]"
              />

              <div className="mt-8 pt-6 border-t border-line">
                <EditableText
                  as="h3"
                  path="omOssOffices.officeName"
                  value={offices.officeName}
                  className="font-heading text-body font-semibold text-navy"
                />
                <EditableText
                  as="p"
                  path="omOssOffices.officeAddress"
                  value={offices.officeAddress}
                  className="mt-1.5 font-ui text-sm text-ink-muted leading-relaxed"
                />
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-16 lg:py-24 gw-bleed-r">
              <EditableImage
                path="omOssOffices.imageUrl"
                src={img(offices.imageUrl || IMAGES.alicanteOffice, 1200)}
                alt={offices.imageAlt || 'Global Working kontorer i Alicante'}
                className="w-full h-[300px] lg:h-[500px] object-cover rounded-panel lg:rounded-r-none"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="om-oss-faq">
        <FAQ />
      </section>
      <PageEndNav current="/om-oss" />
    </>
  )
}
