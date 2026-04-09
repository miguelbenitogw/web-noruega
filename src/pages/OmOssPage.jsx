import AnimateIn from '../components/AnimateIn'
import { IMAGES, img } from '../assets/images'
import OmOss from '../components/OmOss'
import FAQ from '../components/FAQ'
import PageEndNav from '../components/PageEndNav'
import useContent from '../hooks/useContent'
import EditableText, { createArrayItemCommitter, useVisualEditEnabled } from '../components/editable/EditableText'
import InlineRichText from '../components/editable/InlineRichText'
import miriamPhoto from '../assets/team/miriam-svendsen.jpg'
import groPhoto from '../assets/team/gro-anette.jpg'

function InlineEditableParagraph({
  path,
  value,
  onCommit,
  className,
  linkClassName,
  as = 'p',
  ...rest
}) {
  const visualEditEnabled = useVisualEditEnabled()

  if (visualEditEnabled) {
    return (
      <EditableText
        as={as}
        path={path}
        value={value}
        onCommit={onCommit}
        multiline
        className={className}
        {...rest}
      />
    )
  }

  return (
    <InlineRichText
      as={as}
      value={value}
      className={className}
      linkClassName={linkClassName}
      {...rest}
    />
  )
}

function TeamCard({ member, index, basePath, delay, members }) {
  const normalizedName = (member.name || '').toLowerCase()
  let portrait = null

  if (normalizedName.includes('miriam')) portrait = miriamPhoto
  else if (normalizedName.includes('gro')) portrait = groPhoto
  else if (member.hasImage) portrait = IMAGES.ceoPhoto

  const commitName = createArrayItemCommitter({
    basePath,
    fallbackItems: members || [],
    index,
    field: 'name',
  })
  const commitRole = createArrayItemCommitter({
    basePath,
    fallbackItems: members || [],
    index,
    field: 'role',
  })

  return (
    <AnimateIn variant="fadeUp" delay={delay}>
      <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
        {portrait ? (
          <img
            src={portrait}
            alt={member.name}
            className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary-600/20"
            loading="lazy"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center mb-4 ring-4 ring-primary-600/20">
            <span className="text-white font-heading text-2xl font-bold">{member.initials}</span>
          </div>
        )}
        <EditableText
          as="h3"
          path={`${basePath}.${index}.name`}
          value={member.name}
          onCommit={commitName}
          className="font-heading text-lg font-bold text-ink"
        />
        <EditableText
          as="p"
          path={`${basePath}.${index}.role`}
          value={member.role}
          onCommit={commitRole}
          className="text-gray-500 text-sm mt-1"
        />
      </div>
    </AnimateIn>
  )
}

export default function OmOssPage() {
  const hero = useContent('omOssHero')
  const teamSection = useContent('omOssTeam')
  const offices = useContent('omOssOffices')

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-primary-900 to-primary-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,115,190,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="container-xl relative z-10">
          <AnimateIn>
            <nav className="text-blue-200/70 text-sm mb-6" aria-label="Brødsmuler">
              <a href="/" className="hover:text-white transition-colors">Hjem</a>
              <span className="mx-2">/</span>
              <span className="text-white">{hero.breadcrumb}</span>
            </nav>
            <EditableText
              as="h1"
              path="omOssHero.h1"
              value={hero.h1}
              className="font-heading text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            />
            <InlineEditableParagraph
              as="p"
              path="omOssHero.description"
              value={hero.description}
              className="!text-blue-100 text-lg max-w-2xl leading-relaxed"
              linkClassName="!text-blue-50 underline decoration-blue-200 underline-offset-2 transition-colors hover:!text-white hover:!decoration-blue-100"
            />
          </AnimateIn>
        </div>
      </section>

      <OmOss />

      {/* Team Section */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <EditableText
                as="span"
                path="omOssTeam.label"
                value={teamSection.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                as="h2"
                path="omOssTeam.heading"
                value={teamSection.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-4"
              />
              <InlineEditableParagraph
                as="p"
                path="omOssTeam.description"
                value={teamSection.description}
                className="!text-gray-600 leading-relaxed"
              />
            </div>
          </AnimateIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {(teamSection.members || []).map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} basePath="omOssTeam.members" delay={i * 100} members={teamSection.members || []} />
            ))}
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-xl">
          <AnimateIn>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <EditableText
                as="span"
                path="omOssOffices.label"
                value={offices.label}
                className="inline-block text-primary-600 font-semibold text-sm tracking-wide uppercase mb-3"
              />
              <EditableText
                as="h2"
                path="omOssOffices.heading"
                value={offices.heading}
                className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-4"
              />
              <InlineEditableParagraph
                as="p"
                path="omOssOffices.description"
                value={offices.description}
                className="!text-gray-600 leading-relaxed"
              />
            </div>
          </AnimateIn>

          <AnimateIn variant="scale" delay={100}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img
                src={img(IMAGES.alicanteOffice, 1200)}
                alt="Global Working kontorer i Alicante"
                className="w-full h-[360px] md:h-[480px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
                <EditableText
                  as="h3"
                  path="omOssOffices.officeName"
                  value={offices.officeName}
                  className="font-heading text-xl md:text-2xl font-bold mb-2"
                />
                <EditableText
                  as="p"
                  path="omOssOffices.officeAddress"
                  value={offices.officeAddress}
                  className="text-white/80 text-sm md:text-base"
                />
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <section id="om-oss-faq">
        <FAQ />
      </section>
      <PageEndNav current="/om-oss" />
    </>
  )
}
