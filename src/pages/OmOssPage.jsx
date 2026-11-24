import { IMAGES, img } from '../assets/images'
import OmOss from '../components/OmOss'
import FAQ from '../components/FAQ'
import PageEndNav from '../components/PageEndNav'
import PageHero from '../components/ui/PageHero'
import useContent from '../hooks/useContent'
import RichText from '../components/ui/RichText'
const miriamPhoto = IMAGES.contactMiriam
const groPhoto = IMAGES.contactGro

/**
 * Ficha de equipo.
 *
 * Antes: avatar de 96 px con `ring-4` azul dentro de una tarjeta blanca con
 * `shadow-sm hover:shadow-md`, todo centrado. Cuatro medallones idénticos.
 *
 * Si la promesa de la empresa es «detrás hay personas», la persona tiene que
 * verse: retrato vertical a toda la columna, nombre y rol debajo. Sin caja.
 */
function TeamMember({ member }) {
  const normalizedName = (member.name || '').toLowerCase()
  let portrait = member.imageUrl || null

  if (!portrait && normalizedName.includes('miriam')) portrait = miriamPhoto
  else if (!portrait && normalizedName.includes('gro')) portrait = groPhoto
  else if (!portrait && member.hasImage) portrait = IMAGES.ceoPhoto

  // La ficha «Teamet» lleva la foto de grupo, no un retrato: centrada en un 4:5 se
  // queda con la mitad del grupo y parte por el borde a quien caiga justo ahí.
  // Alineada a la izquierda el corte cae sobre la pared, sin cortar caras.
  const isGroupPhoto = /team-hero/.test(portrait || '')

  return (
    <div>
      {portrait ? (
        <img
          src={img(portrait, 640)}
          alt={member.imageAlt || member.name}
          className={`w-full aspect-[4/5] object-cover rounded-panel bg-frost ${isGroupPhoto ? 'object-left-top' : 'object-top'}`}
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

      <h3 className="mt-4 font-heading text-body font-semibold text-navy leading-snug">{member.name}</h3>
      <p className="mt-1 gw-meta leading-snug">{member.role}</p>
    </div>
  )
}

export default function OmOssPage() {
  const hero = useContent('omOssHero')
  const teamSection = useContent('omOssTeam')
  const offices = useContent('omOssOffices')

  return (
    <>
      <PageHero
        current={hero.breadcrumb}
        title={hero.h1}
        titleId="om-oss-hero-heading"
        description={hero.description}
      />

      <OmOss />

      {/* ── Equipo ───────────────────────────────────────────────────────
          Cabecera a dos columnas: el texto largo centrado en serif obliga al
          ojo a buscar el arranque de cada línea. */}
      <section className="py-20 lg:py-28 bg-surface" aria-labelledby="om-oss-team-heading">
        <div className="container-xl">
          {/* Mismo criterio que «Vårt tilbud» en la portada: las dos columnas
              de una cabecera arrancan en la misma línea. Con `items-end` la
              bajada quedaba 90 px por debajo de la etiqueta, colgando del pie
              del titular, y cada cabecera de la web se alineaba distinto. */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-14">
            <div className="lg:col-span-6">
              <span className="gw-label text-primary-600">{teamSection.label}</span>
              <h2 id="om-oss-team-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {teamSection.heading}
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <RichText
                value={teamSection.description}
                className="text-ink-muted text-body leading-[1.6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {(teamSection.members || []).map((member) => (
              <TeamMember key={member.name} member={member} />
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
              <h2 id="om-oss-video-heading" className="text-display-sm font-semibold text-navy">
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
              <span className="gw-label text-primary-600">{offices.label}</span>
              <h2 id="om-oss-offices-heading" className="mt-5 text-display-sm font-semibold text-navy">
                {offices.heading}
              </h2>
              <RichText
                value={offices.description}
                className="mt-6 text-ink-muted text-body leading-[1.6]"
              />

              <div className="mt-8 pt-6 border-t border-line">
                <h3 className="font-heading text-body font-semibold text-navy">{offices.officeName}</h3>
                <p className="mt-1.5 font-ui text-sm text-ink-muted leading-relaxed">
                  {offices.officeAddress}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 pb-16 lg:py-24 gw-bleed-r">
              <img
                src={img(offices.imageUrl || IMAGES.alicanteOffice, 1200)}
                alt={offices.imageAlt || 'Global Working kontorer i Alicante'}
                className="w-full h-[300px] lg:h-[500px] object-cover rounded-panel lg:rounded-r-none"
                loading="lazy"
                decoding="async"
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
