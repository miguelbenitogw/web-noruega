import useContent from '../hooks/useContent'
import { IMAGES } from '../assets/images'
import EditableText, { createArrayItemCommitter } from './editable/EditableText'

const socialIcons = {
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
}

export default function Footer() {
  const c = useContent('footer')
  const links = c.links || {}

  return (
    <footer className="bg-primary-900 text-white" aria-label="Nettstedets bunntekst">
      <div className="container-xl py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3a5 5 0 0 1 4.9 4H5.1A5 5 0 0 1 10 5zm0 10a5 5 0 0 1-4.9-4h9.8A5 5 0 0 1 10 15z" fill="white"/>
                </svg>
              </div>
              <span className="font-heading font-semibold text-lg">
                Global Working <span className="text-primary-400">Norge</span>
              </span>
            </div>
            <EditableText
              as="p"
              path="footer.description"
              value={c.description}
              multiline
              className="text-blue-200 text-sm leading-relaxed mb-6"
            />
            <div className="flex gap-3">
              {(c.social || []).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/10 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {socialIcons[s.label]}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wide mb-5">
                <EditableText
                  as="span"
                  path={`footer.links.${title}`}
                  value={title}
                  className="inline"
                />
              </h3>
              <ul className="space-y-3" role="list">
                {(items || []).map((item, itemIndex) => {
                  const isFunctionalLink = item.href.startsWith('mailto:') || item.href.startsWith('tel:')
                  const commitItemLabel = createArrayItemCommitter({
                    basePath: `footer.links.${title}`,
                    fallbackItems: items,
                    index: itemIndex,
                    field: 'label',
                  })
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-blue-200 text-sm hover:text-white transition-colors duration-200"
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                      >
                        {isFunctionalLink ? item.label : (
                          <EditableText
                            as="span"
                            path={`footer.links.${title}.${itemIndex}.label`}
                            value={item.label}
                            onCommit={commitItemLabel}
                            className="inline"
                          />
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-300 text-sm">
          <p>© {new Date().getFullYear()} Global Working Norge AS. Alle rettigheter forbeholdt.</p>
          <div className="flex gap-6">
            <a href="/personvern" className="hover:text-white transition-colors">Personvern</a>
            <a href="/vilkar" className="hover:text-white transition-colors">Vilkår</a>
            <a href="/cookies" className="hover:text-white transition-colors">Informasjonskapsler</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
