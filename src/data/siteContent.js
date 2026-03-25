// Contenido central de toda la web. Edita desde /admin.
const siteContent = {
  hero: {
    badge: 'Norges ledende rekrutteringspartner',
    h1First: 'Har dere behov for',
    h1Highlight: 'arbeidskraft?',
    description: 'Global Working er verdens st?rste spr?kskole som underviser i norsk utenfor Skandinavia. Vi spesialiserer oss p? norsk spr?k- og kulturoppl?ring for s?reuropeiske fagfolk, og kobler dem med arbeidsgivere i Norge. Vi f?lger kandidatene fra f?rste norsktime til trygg oppstart i jobb.',
    cta1: 'Slik jobber vi',
    cta2: 'Kontakt oss',
    stats: [
      { value: '2014', label: 'Grunnlagt', animate: false },
      { value: '50+', label: 'Ansatte', animate: true },
      { value: '500+', label: 'Kandidater plassert i Norge', animate: true },
      { value: '95%', label: 'Retensjonsgrad', animate: true },
    ],
  },

  homeServices: {
    label: 'V?re tjenester',
    heading: 'V?rt tilbud til norske arbeidsgivere',
    description: 'Vi kobler norske arbeidsgivere med kvalifiserte fagfolk fra S?r-Europa ??" forberedt med spr?k, kultur og fagkompetanse.',
    sections: [
      { title: 'V?r rekrutteringsmodell', description: 'Vi finner, forbereder og f?lger opp fagfolk fra S?r-Europa til trygg oppstart i Norge. Opptil 600 timer norskoppl?ring.', href: '/vr-rekrutteringsmodell' },
      { title: 'Helsesektor', description: 'Norges st?rste leverand?r av sykepleiere utenfra Skandinavia. Spesialisert helsefaglig forberedelse siden 2014.', href: '/helse' },
      { title: 'Talentportalen', description: 'Se tilgjengelige kandidater for fast ansettelse direkte i v?r nye kandidatportal.', href: '/talentportalen' },
      { title: 'Om Global Working', description: 'Grunnlagt i 2014. 50+ ansatte. ISO-sertifisert. Hovedkontor i Alicante med kontor i Oslo.', href: '/om-oss' },
    ],
  },

  homeStats: [
    { value: '500+', label: 'Kandidater plassert i Norge' },
    { value: '95%', label: 'Retensjonsgrad' },
    { value: '25 000+', label: 'Undervisningstimer i norsk' },
  ],

  homeHealth: {
    label: 'Helsesektoren',
    heading: 'Vi st?tter det norske helsevesenet',
    description: 'Global Working er den st?rste leverand?ren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss p? ? utdanne og kvalifisere sykepleiere fra Spania, Italia og Frankrike for arbeid i norsk helsesektor.',
    cta: 'Les mer om helse',
  },

  homeContact: {
    label: 'Kontakt',
    heading: '?~nsker du ? vite mer?',
    description: 'Du treffer oss p? e-post eller telefon. Vi tar kontakt s? snart vi har mulighet.',
    cta: 'Send oss en melding',
  },

  contacts: [
    { name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', email: 'miriam.svendsen@globalworking.net', phone: '+47 919 00 649' },
    { name: 'Gro Anette', role: 'Kandidatoppf?lging', email: 'gro.anette@globalworking.net', phone: '+47 408 98 448' },
  ],

  rekrutteringHero: {
    h1: 'Hva gj?r Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og f?lger prosessen helt frem til trygg oppstart.',
  },

  rekrutteringCollab: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyr?. Vi forbereder kandidatene gjennom strukturert oppl?ring. Deretter ansetter dere kandidaten direkte ??" uten mellomledd.',
    p2: 'Samarbeidet starter med en uforpliktende kartlegging av ditt behov. Vi presenterer s? kvalifiserte kandidater som matcher kravene dere har satt.',
    p3: 'Gjennom v?r nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  helseHero: {
    h1: 'Tjenester for helseinstitusjoner',
    description: 'Vi forbereder helsepersonell for den norske helsesektoren ??" fra spr?koppl?ring til trygg oppstart i jobb.',
  },

  helsePhases: {
    label: 'Rekrutteringsprosessen',
    heading: 'Slik rekrutterer vi sykepleiere til Norge',
    description: 'V?r prosess er delt inn i tre faser for ? sikre at kandidatene er godt forberedt f?r de starter i jobb.',
    phases: [
      {
        number: '01',
        title: 'Spr?k og faglig forberedelse',
        description: 'Kandidatene gjennomf?rer opptil 600 undervisningstimer i norsk, helseterminologi og praktisk spr?kbruk i kliniske situasjoner.',
        formats: [
          { label: 'Fysisk i Alicante', duration: '5 m?neder' },
          { label: 'Kombinasjon fysisk og nett', duration: '7 m?neder' },
          { label: 'Full nettbasert oppl?ring', duration: '9 m?neder' },
        ],
      },
      {
        number: '02',
        title: 'Strukturert overgang',
        description: '1??"4 uker etter avsluttet oppl?ring gjennomf?res intervju med arbeidsgivere. Vi koordinerer oppstart og avreisedato med begge parter.',
        formats: null,
      },
      {
        number: '03',
        title: 'Ekstra oppf?lging',
        description: 'Ved behov tilrettelegger vi individuell spr?ktrening f?r og etter avreise. Vi kj?rer 17??"20 oppl?ringsgrupper ?rlig for ? sikre kontinuitet.',
        formats: null,
      },
    ],
  },

  helsePartnership: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyr?. Vi forbereder kandidatene gjennom strukturert oppl?ring. Deretter ansetter dere kandidaten direkte ??" uten mellomledd.',
    p2: 'Gjennom v?r nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  omOssHero: {
    h1: 'Om oss',
    description: 'Global Working er en spesialisert akt?r innen spr?koppl?ring og internasjonal rekruttering.',
  },

  omOssTeam: {
    label: 'V?rt team',
    heading: 'M?t teamet i Global Working',
    description: 'V?rt flerfaglige team av psykologer, spr?kl?rere og rekrutteringsspesialister sikrer en helhetlig prosess ??" fra utvelgelse og oppl?ring til oppf?lging i Norge.',
    members: [
      { initials: 'PS', name: 'Pablo Santamarina', role: 'CEO & Grunnlegger', hasImage: true },
      { initials: 'MS', name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', hasImage: false },
      { initials: 'GA', name: 'Gro Anette', role: 'Kandidatoppf?lging', hasImage: false },
      { initials: 'T', name: 'Teamet', role: '50+ ansatte i Alicante og Oslo', hasImage: false },
    ],
  },

  omOssOffices: {
    label: 'Lokasjon',
    heading: 'V?re kontorer',
    description: 'Global Working har hovedkontor i Alicante, Spania, med kontor i Oslo.',
    officeName: 'Hovedkontor ??" Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, Espa?a',
  },

  talentportalenHero: {
    h1: 'Kandidatportal for arbeidsgivere',
    description: 'Se tilgjengelige kandidater og inviter til intervju direkte gjennom v?r nye plattform.',
  },

  talentportalenSteps: {
    label: 'Steg for steg',
    heading: 'Slik bruker du portalen',
    steps: [
      { number: '01', title: 'Opprett konto', desc: 'Ta kontakt med oss for ? f? tilgang til kandidatportalen.' },
      { number: '02', title: 'Bla gjennom kandidater', desc: 'Se profiler, spr?kniv?, fagbakgrunn og tilgjengelighet.' },
      { number: '03', title: 'Inviter til intervju', desc: 'Velg kandidater som passer og inviter dem direkte til intervju.' },
      { number: '04', title: 'Ansett direkte', desc: 'Dere ansetter kandidaten direkte ??" uten mellomledd.' },
    ],
  },

  talentportalenBenefits: {
    label: 'Hvorfor portalen',
    heading: 'Fordeler med kandidatportalen',
    items: [
      'Sanntidsoversikt over tilgjengelige kandidater',
      'Detaljerte profiler med spr?kniv? og erfaring',
      'Direkte kommunikasjon med rekrutteringsteamet',
      'Gratis tilgang for arbeidsgivere som samarbeider med oss',
    ],
  },

  kontaktHero: {
    h1: 'Kontakt oss',
    description: 'Vi er tilgjengelige for sp?rsm?l om rekruttering, samarbeid og kandidatportal. Ta kontakt ??" vi svarer normalt innen 1 virkedag.',
  },

  nyheterHero: {
    h1: 'Nyheter & Artikler',
    description: 'F?lg med p? siste nytt fra Global Working ??" artikler, oppdateringer og historier fra v?rt arbeid med rekruttering og spr?koppl?ring.',
  },

  hvaGjor: {
    label: 'V?r prosess',
    heading: 'Hva gj?r Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og f?lger prosessen helt frem til trygg oppstart.',
    services: [
      { title: 'Rekrutterer kompetanse', description: 'Vi rekrutterer kompetansen dere trenger innen flere sektorer, blant annet helse og omsorg, industri og bygg, samt utdanning og barneomsorg.' },
      { title: 'S?rger for ?nsket spr?kniv?', description: 'Vi underviser fra ingen forkunnskaper til opptil B2-niv?, og tilpasser spr?k, rolle og arbeidshverdag til m?lene dere har satt.' },
      { title: 'Trygg oppstart i Norge', description: 'Vi hjelper kandidatene gjennom hele prosessen med n?dvendige dokumenter og riktig papirarbeid, med ekstra spr?ktimer ved behov.' },
    ],
    ctaLabel: 'Book et m?te med oss',
    ctaNote: 'Uforpliktende kartlegging av behov',
  },

  rekrutteringComp: {
    label: 'V?r rekrutteringsmodell',
    heading: 'Slik rekrutterer vi fagfolk til Norge',
    p1: 'V?re kandidater kommer hovedsakelig fra Spania, Italia og Frankrike, og er motiverte fagpersoner som ?nsker ? jobbe i Norge over lengre tid eller etablere seg her p? sikt.',
    p2: 'Undervisningen kan gjennomf?res fysisk i Alicante (5 m?neder), som kombinasjon av fysisk og nettbasert undervisning (7 m?neder), eller fullt nettbasert (9 m?neder).',
    sectors: ['Helse og omsorg', 'Industri og bygg', 'Utdanning', 'Barneomsorg'],
    badge: 'Strukturert modell siden 2014',
    steps: [
      { title: 'Rekrutterer kompetansen du trenger', description: 'Vi kartlegger kompetanse, motivasjon og ?nsker f?r kandidatene presenteres for arbeidsgiver.' },
      { title: 'Spr?k og faglig forberedelse', description: 'Alle kandidater f?lger et strukturert l?p med opptil 600 timer norsk, bransjeterminologi og arbeidskultur.' },
      { title: 'Strukturert overgang', description: '1??"4 uker etter oppl?ring gjennomf?res intervju med arbeidsgivere, og oppstart og avreisedato avtales.' },
      { title: 'Ekstra oppf?lging ved behov', description: 'Ved behov tilrettelegger vi individuelt opplegg med ekstra spr?ktrening f?r eller etter avreise.' },
    ],
  },

  helsesektorComp: {
    label: 'Tjenester for helseinstitusjoner',
    heading: 'Vi forbereder helsepersonell for den norske helsesektoren',
    description: 'Global Working er den st?rste leverand?ren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss p? ? utdanne og kvalifisere sykepleiere for arbeid i Norge.',
    stats: [
      { value: '10+ ?r', label: 'erfaring i Norge' },
      { value: '25 000+', label: 'undervisningstimer i norsk' },
      { value: '600', label: 'timer oppl?ring (opptil)' },
    ],
    features: [
      { title: 'Spr?k og faglig forberedelse f?r ansettelse', description: 'Kandidatene f?r opptil 600 undervisningstimer i norsk, helseterminologi og praktisk spr?kbruk i kliniske situasjoner.' },
      { title: 'Tre oppl?ringsmodeller', description: 'Fysisk i Alicante (5 m?neder), kombinasjon fysisk og nett (7 m?neder), eller full nettbasert oppl?ring (9 m?neder).' },
      { title: 'Strukturert overgang til arbeidsgiver', description: 'Intervju skjer 1??"4 uker etter avsluttet oppl?ring. Vi koordinerer oppstart og avreisedato med begge parter.' },
      { title: 'Ekstra oppf?lging ved behov', description: 'Vi kan tilrettelegge individuell spr?ktrening f?r og etter avreise for ? redusere usikkerhet i oppstarten.' },
    ],
    blockquote: { text: 'Vi ?nsket ? tilby 6 sykepleiere fast stilling gjennom samarbeid med Global Working. For oss ble dette en god l?sning p? bemanningskrisen vi hadde.', author: 'Kristina S, V?g? kommune' },
    groupsValue: '17??"20',
    groupsLabel: 'grupper ?rlig',
    ctaLabel: 'Be om kandidater',
  },

  omOssComp: {
    label: 'Om oss',
    heading: 'Hvem er Global Working?',
    p1: 'Global Working er en spesialisert akt?r innen spr?koppl?ring og internasjonal rekruttering i Europa. Vi forbereder kandidater f?r ansettelse, slik at arbeidsgivere f?r medarbeidere og grunnlag for varige ansettelser.',
    p2: 'Global Working ble etablert i 2014 med m?l om ? gj?re det enklere for fagpersoner ? bevege seg i det europeiske arbeidsmarkedet. I dag kombinerer vi rekruttering, spr?koppl?ring og tett oppf?lging for ? sikre forutsigbare og b?rekraftige ansettelser.',
    blockquote: { text: 'For oss handler internasjonal rekruttering ikke bare om ? fylle en stilling. Det handler om ? forberede mennesker grundig, slik at b?de arbeidsgiver og kandidat f?r en trygg start og et langsiktig samarbeid.', author: 'Pablo, CEO Global Working' },
    stats: [
      { value: '2014', label: 'Etablert' },
      { value: '50', label: 'Ansatte' },
      { value: 'ISO', label: 'Sertifisert' },
    ],
    locationLabel: 'Alicante',
    locationSub: 'Hovedkontor med kontor i Oslo',
    values: [
      { title: 'Seleksjon med faglig vurdering', desc: '25 % av teamet er psykologer som jobber med seleksjon, vurdering og oppf?lging av kandidater.' },
      { title: 'Yrkesrettet spr?koppl?ring', desc: '55 % av teamet er spr?kl?rere med spesialisering i yrkesrettet spr?koppl?ring.' },
      { title: 'Kvalitetssikret prosess', desc: 'Vi er ISO-sertifisert for spr?kundervisning og internasjonal rekruttering i Europa.' },
    ],
  },

  talentportalenComp: {
    label: 'Talentportalen',
    heading: 'Ny kandidatportal for arbeidsgivere',
    description: 'Global Working har f?tt ny kandidatportal. N? kan du selv g? inn og se hvilke kandidater vi har tilgjengelig for fast ansettelse.',
    portalUrl: 'https://globalworking-talentportal.lovable.app',
    ctaLogin: 'Logg inn p? portalen',
    ctaContact: 'Kontakt oss',
    benefits: [
      { title: 'Se kandidater for fast ansettelse', desc: 'F? oversikt over tilgjengelige kandidater og finn profiler som passer deres behov.' },
      { title: 'Inviter til intervju direkte', desc: 'Arbeidsgivere kan selv g? gjennom profiler og invitere aktuelle kandidater til intervju.' },
      { title: 'Oversikt over spr?kforberedelse', desc: 'Se status i spr?k- og faglig forberedelse, slik at oppstarten kan planlegges tryggere.' },
      { title: 'Rask dialog med oss', desc: 'Portalen er koblet til rekrutteringsteamet v?rt for korte avklaringer underveis.' },
    ],
  },

  godeGrunner: {
    label: 'Et samarbeid som gir nye l?sninger',
    heading: 'Hva sier kommunene vi samarbeider med?',
    description: 'Mangelen p? helsepersonell kombinert med sykefrav?r og permisjoner gj?r det n?dvendig ? finne varige l?sninger p? arbeidskraft for ? gi pasientene oppf?lgingen de trenger.',
    articleLink: '/nyheter/sor-fron-integrasjon',
    articleLinkLabel: 'Les artikkel',
    testimonials: [
      { quote: 'Vi har v?rt veldig forn?yd med to av v?re sykepleiere fra Spania. Spr?ket var mye bedre enn forventet, og de passet godt inn hos oss.', author: 'Karin, ?.mot kommune' },
      { quote: 'Vi fant en god l?sning med ? la en sykepleier jobbe i helsefagarbeider-stilling til hun var bedre i spr?ket. Tre-fire uker etterp? var hun klar til ? jobbe fast som sykepleier hos oss.', author: 'Daniel, Kautokeino kommune' },
      { quote: 'Vi var veldig glade for ? f? en sykepleier fra Italia som en del av teamet v?rt. Han l?rte seg spr?ket fort n?r han begynte ? jobbe.', author: 'Anne, Trondheim kommune' },
    ],
  },

  ctaBanner: {
    badge: 'Klar til ? starte?',
    heading: 'Finn riktig kompetanse for din virksomhet i dag',
    description: 'Vi kobler norske arbeidsgivere med kandidater som er spr?klig og faglig forberedt for trygg oppstart.',
    cta1: 'Kontakt oss n?',
    cta2: 'Se kandidater',
  },

  faq: {
    label: 'Sp?rsm?l & svar',
    heading: 'Ofte stilte sp?rsm?l',
    description: 'Finn svar p? de vanligste sp?rsm?lene om rekruttering og samarbeid med Global Working.',
    ctaText: 'Fant du ikke svaret? Kontakt oss',
    items: [
      { q: 'Hvor lang tid tar rekrutteringsprosessen?', a: 'Tidslinjen avhenger av valgt oppl?ringsl?p: fysisk (5 m?neder), hybrid (7 m?neder) eller fullt nettbasert (9 m?neder). Intervjuer med arbeidsgiver skjer normalt 1??"4 uker etter oppl?ring.' },
      { q: 'Hvilket spr?kniv? har kandidatene n?r de ankommer Norge?', a: 'Kandidatene f?lger et strukturert l?p med opptil 600 undervisningstimer i norsk, bransjespesifikk terminologi og innf?ring i norsk arbeidskultur. M?let settes ut fra rollekrav, ofte opp mot B2.' },
      { q: 'Hvilke sektorer dekker dere?', a: 'Vi rekrutterer prim?rt til helse og omsorg, industri og bygg, samt utdanning og barneomsorg. Helsesektoren er v?rt spesialfelt, der vi har levert kvalifiserte sykepleiere siden 2015.' },
      { q: 'Hva koster det ? bruke Global Working?', a: 'Pris avhenger av behov og omfang. Vi g?r gjennom modell og priser i et uforpliktende kartleggingsm?te, slik at l?sningen tilpasses virksomheten deres.' },
      { q: 'Hvordan sikrer dere kvaliteten p? kandidatene?', a: 'Vi kombinerer seleksjon, spr?kforberedelse og tett oppf?lging f?r oppstart. Teamet v?rt inkluderer b?de psykologer og spr?kl?rere, og prosessene er ISO-sertifiserte.' },
      { q: 'Tilbyr dere oppf?lging etter ansettelse?', a: 'Ja. Vi f?lger opp kandidaten og arbeidsgiveren gjennom pr?veperioden med ekstra spr?ktimer, st?tte med dokumentasjon og jevnlige samtalepunkter for ? sikre en vellykket integrering.' },
    ],
  },

  navbar: {
    links: [
      { label: 'V?r rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
      { label: 'Helsesektor', href: '/helse' },
      { label: 'Nyheter', href: '/nyheter' },
      { label: 'Talentportalen', href: '/talentportalen' },
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
    ctaLabel: 'Kom i gang',
  },

  footer: {
    description: 'Rekruttering og spr?koppl?ring for kvalifiserte fagfolk til det norske arbeidsmarkedet, med strukturert oppf?lging fra f?rste kontakt til oppstart.',
    social: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/globalworking-norge' },
      { label: 'Instagram', href: 'https://www.instagram.com/globalworkingnorge' },
    ],
    links: {
      Tjenester: [
        { label: 'V?r rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
        { label: 'Helsesektor', href: '/helse' },
        { label: 'Talentportalen', href: '/talentportalen' },
        { label: 'Kontakt', href: '/kontakt' },
      ],
      Selskapet: [
        { label: 'Om oss', href: '/om-oss' },
        { label: 'Nyheter', href: '/nyheter' },
        { label: 'Kontakt', href: '/kontakt' },
        { label: 'Personvern', href: '/personvern' },
      ],
      Kontakt: [
        { label: 'Miriam.Svendsen@globalworking.net', href: 'mailto:Miriam.Svendsen@globalworking.net' },
        { label: '+47 919 00 649', href: 'tel:+4791900649' },
        { label: 'Gro.anette@globalworking.net', href: 'mailto:Gro.anette@globalworking.net' },
        { label: '+47 408 98 448', href: 'tel:+4740898448' },
      ],
    },
  },

  kontaktComp: {
    label: 'Kontakt',
    heading: '?~nsker du ? vite mer?',
    description: 'Du treffer oss p? e-post eller telefon, eller ved ? fylle ut skjemaet under. Vi tar kontakt s? snart vi har mulighet.',
    officeTitle: 'Hovedkontor Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, Espa?a',
  },

  legalPersonvern: {
    breadcrumb: 'Personvern',
    title: 'Personvernerkl?ring',
    intro: 'Denne siden forklarer hvilke personopplysninger vi behandler, hvorfor vi gj?r det og hvilke rettigheter du har.',
    blocks: [
      {
        heading: 'Hvem er behandlingsansvarlig?',
        body: 'Global Working Norge AS er behandlingsansvarlig for personopplysninger som samles inn via dette nettstedet.',
      },
      {
        heading: 'Hvilke opplysninger vi behandler',
        body: 'Vi kan behandle kontaktinformasjon, henvendelser sendt via skjema, og tekniske data som IP-adresse, nettleser og bruksm?nster.',
      },
      {
        heading: 'Form?l og rettslig grunnlag',
        body: 'Opplysninger behandles for ? besvare henvendelser, levere tjenester, forbedre nettstedet og oppfylle lovp?lagte krav.',
      },
      {
        heading: 'Lagring og deling',
        body: 'Personopplysninger lagres ikke lenger enn n?dvendig. Vi kan dele data med databehandlere som leverer drift, analyse eller kommunikasjonstjenester.',
      },
      {
        heading: 'Dine rettigheter',
        body: 'Du kan be om innsyn, retting, sletting, begrensning eller dataportabilitet, og protestere p? behandling der det er relevant.',
      },
    ],
  },

  legalVilkar: {
    breadcrumb: 'Vilk?r',
    title: 'Vilk?r for bruk',
    intro: 'Disse vilk?rene regulerer bruk av nettstedet og relaterte tjenester fra Global Working Norge.',
    blocks: [
      {
        heading: 'Generelt',
        body: 'Ved ? bruke dette nettstedet aksepterer du disse vilk?rene. Dersom du ikke aksepterer vilk?rene, ber vi deg avst? fra bruk.',
      },
      {
        heading: 'Innhold og immaterielle rettigheter',
        body: 'Alt innhold p? nettstedet tilh?rer Global Working Norge eller v?re lisensgivere, med mindre annet er oppgitt.',
      },
      {
        heading: 'Ansvarsbegrensning',
        body: 'Vi tilstreber korrekt og oppdatert informasjon, men kan ikke garantere at alt innhold alltid er feilfritt. Bruk av nettstedet skjer p? eget ansvar.',
      },
      {
        heading: 'Lenker til tredjepart',
        body: 'Nettstedet kan inneholde lenker til eksterne nettsteder. Vi er ikke ansvarlige for innhold eller praksis p? slike nettsteder.',
      },
      {
        heading: 'Endringer i vilk?r',
        body: 'Vi kan oppdatere vilk?rene ved behov. Oppdatert versjon publiseres p? denne siden med virkning fra publiseringsdato.',
      },
    ],
  },

  legalCookies: {
    breadcrumb: 'Informasjonskapsler',
    title: 'Informasjonskapsler (cookies)',
    intro: 'Denne siden forklarer hvilke informasjonskapsler vi bruker, og hvordan du kan kontrollere eller trekke tilbake samtykke.',
    blocks: [
      {
        heading: 'Hva er cookies?',
        body: 'Cookies er sm? tekstfiler som lagres i nettleseren din for ? f? nettstedet til ? fungere, forbedre brukeropplevelsen og m?le bruk.',
      },
      {
        heading: 'Typer cookies vi bruker',
        body: 'Vi bruker n?dvendige cookies for grunnleggende funksjonalitet, samt valgfri statistikk/analytiske cookies n?r du samtykker.',
      },
      {
        heading: 'Samtykke og administrasjon',
        body: 'Du kan n?r som helst endre cookie-valg i nettleseren din eller ved ? oppdatere samtykket p? nettstedet.',
      },
      {
        heading: 'Tredjepartscookies',
        body: 'Dersom analyseverkt?y er aktivert, kan tredjepartsleverand?rer sette cookies i henhold til sine egne retningslinjer.',
      },
      {
        heading: 'Kontakt',
        body: 'Har du sp?rsm?l om v?r bruk av cookies, kontakt oss p? kontakt@globalworking.no.',
      },
    ],
  },
}

export default siteContent
