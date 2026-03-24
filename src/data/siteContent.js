// Contenido central de toda la web. Edita desde /admin.
const siteContent = {
  hero: {
    badge: 'Norges ledende rekrutteringspartner',
    h1First: 'Har dere behov for',
    h1Highlight: 'arbeidskraft?',
    description: 'Global Working er verdens stÃ¸rste sprÃ¥kskole som underviser i norsk utenfor Skandinavia. Vi spesialiserer oss pÃ¥ norsk sprÃ¥k- og kulturopplÃ¦ring for sÃ¸reuropeiske fagfolk, og kobler dem med arbeidsgivere i Norge. Vi fÃ¸lger kandidatene fra fÃ¸rste norsktime til trygg oppstart i jobb.',
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
    label: 'VÃ¥re tjenester',
    heading: 'VÃ¥rt tilbud til norske arbeidsgivere',
    description: 'Vi kobler norske arbeidsgivere med kvalifiserte fagfolk fra SÃ¸r-Europa â€“ forberedt med sprÃ¥k, kultur og fagkompetanse.',
    sections: [
      { title: 'VÃ¥r rekrutteringsmodell', description: 'Vi finner, forbereder og fÃ¸lger opp fagfolk fra SÃ¸r-Europa til trygg oppstart i Norge. Opptil 600 timer norskopplÃ¦ring.', href: '/vr-rekrutteringsmodell' },
      { title: 'Helsesektor', description: 'Norges stÃ¸rste leverandÃ¸r av sykepleiere utenfra Skandinavia. Spesialisert helsefaglig forberedelse siden 2014.', href: '/helse' },
      { title: 'Talentportalen', description: 'Se tilgjengelige kandidater for fast ansettelse direkte i vÃ¥r nye kandidatportal.', href: '/talentportalen' },
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
    heading: 'Vi stÃ¸tter det norske helsevesenet',
    description: 'Global Working er den stÃ¸rste leverandÃ¸ren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss pÃ¥ Ã¥ utdanne og kvalifisere sykepleiere fra Spania, Italia og Frankrike for arbeid i norsk helsesektor.',
    cta: 'Les mer om helse',
  },

  homeContact: {
    label: 'Kontakt',
    heading: 'Ã˜nsker du Ã¥ vite mer?',
    description: 'Du treffer oss pÃ¥ e-post eller telefon. Vi tar kontakt sÃ¥ snart vi har mulighet.',
    cta: 'Send oss en melding',
  },

  contacts: [
    { name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', email: 'miriam.svendsen@globalworking.net', phone: '+47 919 00 649' },
    { name: 'Gro Anette', role: 'KandidatoppfÃ¸lging', email: 'gro.anette@globalworking.net', phone: '+47 408 98 448' },
  ],

  rekrutteringHero: {
    h1: 'Hva gjÃ¸r Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og fÃ¸lger prosessen helt frem til trygg oppstart.',
  },

  rekrutteringCollab: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyrÃ¥. Vi forbereder kandidatene gjennom strukturert opplÃ¦ring. Deretter ansetter dere kandidaten direkte â€“ uten mellomledd.',
    p2: 'Samarbeidet starter med en uforpliktende kartlegging av ditt behov. Vi presenterer sÃ¥ kvalifiserte kandidater som matcher kravene dere har satt.',
    p3: 'Gjennom vÃ¥r nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  helseHero: {
    h1: 'Tjenester for helseinstitusjoner',
    description: 'Vi forbereder helsepersonell for den norske helsesektoren â€“ fra sprÃ¥kopplÃ¦ring til trygg oppstart i jobb.',
  },

  helsePhases: {
    label: 'Rekrutteringsprosessen',
    heading: 'Slik rekrutterer vi sykepleiere til Norge',
    description: 'VÃ¥r prosess er delt inn i tre faser for Ã¥ sikre at kandidatene er godt forberedt fÃ¸r de starter i jobb.',
    phases: [
      {
        number: '01',
        title: 'SprÃ¥k og faglig forberedelse',
        description: 'Kandidatene gjennomfÃ¸rer opptil 600 undervisningstimer i norsk, helseterminologi og praktisk sprÃ¥kbruk i kliniske situasjoner.',
        formats: [
          { label: 'Fysisk i Alicante', duration: '5 mÃ¥neder' },
          { label: 'Kombinasjon fysisk og nett', duration: '7 mÃ¥neder' },
          { label: 'Full nettbasert opplÃ¦ring', duration: '9 mÃ¥neder' },
        ],
      },
      {
        number: '02',
        title: 'Strukturert overgang',
        description: '1â€“4 uker etter avsluttet opplÃ¦ring gjennomfÃ¸res intervju med arbeidsgivere. Vi koordinerer oppstart og avreisedato med begge parter.',
        formats: null,
      },
      {
        number: '03',
        title: 'Ekstra oppfÃ¸lging',
        description: 'Ved behov tilrettelegger vi individuell sprÃ¥ktrening fÃ¸r og etter avreise. Vi kjÃ¸rer 17â€“20 opplÃ¦ringsgrupper Ã¥rlig for Ã¥ sikre kontinuitet.',
        formats: null,
      },
    ],
  },

  helsePartnership: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyrÃ¥. Vi forbereder kandidatene gjennom strukturert opplÃ¦ring. Deretter ansetter dere kandidaten direkte â€“ uten mellomledd.',
    p2: 'Gjennom vÃ¥r nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  omOssHero: {
    h1: 'Om oss',
    description: 'Global Working er en spesialisert aktÃ¸r innen sprÃ¥kopplÃ¦ring og internasjonal rekruttering.',
  },

  omOssTeam: {
    label: 'VÃ¥rt team',
    heading: 'MÃ¸t teamet i Global Working',
    description: 'VÃ¥rt flerfaglige team av psykologer, sprÃ¥klÃ¦rere og rekrutteringsspesialister sikrer en helhetlig prosess â€” fra utvelgelse og opplÃ¦ring til oppfÃ¸lging i Norge.',
    members: [
      { initials: 'PS', name: 'Pablo Santamarina', role: 'CEO & Grunnlegger', hasImage: true },
      { initials: 'MS', name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', hasImage: false },
      { initials: 'GA', name: 'Gro Anette', role: 'KandidatoppfÃ¸lging', hasImage: false },
      { initials: 'T', name: 'Teamet', role: '50+ ansatte i Alicante og Oslo', hasImage: false },
    ],
  },

  omOssOffices: {
    label: 'Lokasjon',
    heading: 'VÃ¥re kontorer',
    description: 'Global Working har hovedkontor i Alicante, Spania, med kontor i Oslo.',
    officeName: 'Hovedkontor â€” Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, EspaÃ±a',
  },

  talentportalenHero: {
    h1: 'Kandidatportal for arbeidsgivere',
    description: 'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vÃ¥r nye plattform.',
  },

  talentportalenSteps: {
    label: 'Steg for steg',
    heading: 'Slik bruker du portalen',
    steps: [
      { number: '01', title: 'Opprett konto', desc: 'Ta kontakt med oss for Ã¥ fÃ¥ tilgang til kandidatportalen.' },
      { number: '02', title: 'Bla gjennom kandidater', desc: 'Se profiler, sprÃ¥knivÃ¥, fagbakgrunn og tilgjengelighet.' },
      { number: '03', title: 'Inviter til intervju', desc: 'Velg kandidater som passer og inviter dem direkte til intervju.' },
      { number: '04', title: 'Ansett direkte', desc: 'Dere ansetter kandidaten direkte â€“ uten mellomledd.' },
    ],
  },

  talentportalenBenefits: {
    label: 'Hvorfor portalen',
    heading: 'Fordeler med kandidatportalen',
    items: [
      'Sanntidsoversikt over tilgjengelige kandidater',
      'Detaljerte profiler med sprÃ¥knivÃ¥ og erfaring',
      'Direkte kommunikasjon med rekrutteringsteamet',
      'Gratis tilgang for arbeidsgivere som samarbeider med oss',
    ],
  },

  kontaktHero: {
    h1: 'Kontakt oss',
    description: 'Vi er tilgjengelige for spÃ¸rsmÃ¥l om rekruttering, samarbeid og kandidatportal. Ta kontakt â€“ vi svarer normalt innen 1 virkedag.',
  },

  nyheterHero: {
    h1: 'Nyheter & Artikler',
    description: 'FÃ¸lg med pÃ¥ siste nytt fra Global Working â€“ artikler, oppdateringer og historier fra vÃ¥rt arbeid med rekruttering og sprÃ¥kopplÃ¦ring.',
  },

  hvaGjor: {
    label: 'VÃ¥r prosess',
    heading: 'Hva gjÃ¸r Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og fÃ¸lger prosessen helt frem til trygg oppstart.',
    services: [
      { title: 'Rekrutterer kompetanse', description: 'Vi rekrutterer kompetansen dere trenger innen flere sektorer, blant annet helse og omsorg, industri og bygg, samt utdanning og barneomsorg.' },
      { title: 'SÃ¸rger for Ã¸nsket sprÃ¥knivÃ¥', description: 'Vi underviser fra ingen forkunnskaper til opptil B2-nivÃ¥, og tilpasser sprÃ¥k, rolle og arbeidshverdag til mÃ¥lene dere har satt.' },
      { title: 'Trygg oppstart i Norge', description: 'Vi hjelper kandidatene gjennom hele prosessen med nÃ¸dvendige dokumenter og riktig papirarbeid, med ekstra sprÃ¥ktimer ved behov.' },
    ],
    ctaLabel: 'Book et mÃ¸te med oss',
    ctaNote: 'Uforpliktende kartlegging av behov',
  },

  rekrutteringComp: {
    label: 'VÃ¥r rekrutteringsmodell',
    heading: 'Slik rekrutterer vi fagfolk til Norge',
    p1: 'VÃ¥re kandidater kommer hovedsakelig fra Spania, Italia og Frankrike, og er motiverte fagpersoner som Ã¸nsker Ã¥ jobbe i Norge over lengre tid eller etablere seg her pÃ¥ sikt.',
    p2: 'Undervisningen kan gjennomfÃ¸res fysisk i Alicante (5 mÃ¥neder), som kombinasjon av fysisk og nettbasert undervisning (7 mÃ¥neder), eller fullt nettbasert (9 mÃ¥neder).',
    sectors: ['Helse og omsorg', 'Industri og bygg', 'Utdanning', 'Barneomsorg'],
    badge: 'Strukturert modell siden 2014',
    steps: [
      { title: 'Rekrutterer kompetansen du trenger', description: 'Vi kartlegger kompetanse, motivasjon og Ã¸nsker fÃ¸r kandidatene presenteres for arbeidsgiver.' },
      { title: 'SprÃ¥k og faglig forberedelse', description: 'Alle kandidater fÃ¸lger et strukturert lÃ¸p med opptil 600 timer norsk, bransjeterminologi og arbeidskultur.' },
      { title: 'Strukturert overgang', description: '1â€“4 uker etter opplÃ¦ring gjennomfÃ¸res intervju med arbeidsgivere, og oppstart og avreisedato avtales.' },
      { title: 'Ekstra oppfÃ¸lging ved behov', description: 'Ved behov tilrettelegger vi individuelt opplegg med ekstra sprÃ¥ktrening fÃ¸r eller etter avreise.' },
    ],
  },

  helsesektorComp: {
    label: 'Tjenester for helseinstitusjoner',
    heading: 'Vi forbereder helsepersonell for den norske helsesektoren',
    description: 'Global Working er den stÃ¸rste leverandÃ¸ren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss pÃ¥ Ã¥ utdanne og kvalifisere sykepleiere for arbeid i Norge.',
    stats: [
      { value: '10+ Ã¥r', label: 'erfaring i Norge' },
      { value: '25 000+', label: 'undervisningstimer i norsk' },
      { value: '600', label: 'timer opplÃ¦ring (opptil)' },
    ],
    features: [
      { title: 'SprÃ¥k og faglig forberedelse fÃ¸r ansettelse', description: 'Kandidatene fÃ¥r opptil 600 undervisningstimer i norsk, helseterminologi og praktisk sprÃ¥kbruk i kliniske situasjoner.' },
      { title: 'Tre opplÃ¦ringsmodeller', description: 'Fysisk i Alicante (5 mÃ¥neder), kombinasjon fysisk og nett (7 mÃ¥neder), eller full nettbasert opplÃ¦ring (9 mÃ¥neder).' },
      { title: 'Strukturert overgang til arbeidsgiver', description: 'Intervju skjer 1â€“4 uker etter avsluttet opplÃ¦ring. Vi koordinerer oppstart og avreisedato med begge parter.' },
      { title: 'Ekstra oppfÃ¸lging ved behov', description: 'Vi kan tilrettelegge individuell sprÃ¥ktrening fÃ¸r og etter avreise for Ã¥ redusere usikkerhet i oppstarten.' },
    ],
    blockquote: { text: 'Vi Ã¸nsket Ã¥ tilby 6 sykepleiere fast stilling gjennom samarbeid med Global Working. For oss ble dette en god lÃ¸sning pÃ¥ bemanningskrisen vi hadde.', author: 'Kristina S, VÃ¥gÃ¥ kommune' },
    groupsValue: '17â€“20',
    groupsLabel: 'grupper Ã¥rlig',
    ctaLabel: 'Be om kandidater',
  },

  omOssComp: {
    label: 'Om oss',
    heading: 'Hvem er Global Working?',
    p1: 'Global Working er en spesialisert aktÃ¸r innen sprÃ¥kopplÃ¦ring og internasjonal rekruttering i Europa. Vi forbereder kandidater fÃ¸r ansettelse, slik at arbeidsgivere fÃ¥r medarbeidere og grunnlag for varige ansettelser.',
    p2: 'Global Working ble etablert i 2014 med mÃ¥l om Ã¥ gjÃ¸re det enklere for fagpersoner Ã¥ bevege seg i det europeiske arbeidsmarkedet. I dag kombinerer vi rekruttering, sprÃ¥kopplÃ¦ring og tett oppfÃ¸lging for Ã¥ sikre forutsigbare og bÃ¦rekraftige ansettelser.',
    blockquote: { text: 'For oss handler internasjonal rekruttering ikke bare om Ã¥ fylle en stilling. Det handler om Ã¥ forberede mennesker grundig, slik at bÃ¥de arbeidsgiver og kandidat fÃ¥r en trygg start og et langsiktig samarbeid.', author: 'Pablo, CEO Global Working' },
    stats: [
      { value: '2014', label: 'Etablert' },
      { value: '50', label: 'Ansatte' },
      { value: 'ISO', label: 'Sertifisert' },
    ],
    locationLabel: 'Alicante',
    locationSub: 'Hovedkontor med kontor i Oslo',
    values: [
      { title: 'Seleksjon med faglig vurdering', desc: '25 % av teamet er psykologer som jobber med seleksjon, vurdering og oppfÃ¸lging av kandidater.' },
      { title: 'Yrkesrettet sprÃ¥kopplÃ¦ring', desc: '55 % av teamet er sprÃ¥klÃ¦rere med spesialisering i yrkesrettet sprÃ¥kopplÃ¦ring.' },
      { title: 'Kvalitetssikret prosess', desc: 'Vi er ISO-sertifisert for sprÃ¥kundervisning og internasjonal rekruttering i Europa.' },
    ],
  },

  talentportalenComp: {
    label: 'Talentportalen',
    heading: 'Ny kandidatportal for arbeidsgivere',
    description: 'Global Working har fÃ¥tt ny kandidatportal. NÃ¥ kan du selv gÃ¥ inn og se hvilke kandidater vi har tilgjengelig for fast ansettelse.',
    portalUrl: 'https://globalworking-talentportal.lovable.app',
    ctaLogin: 'Logg inn pÃ¥ portalen',
    ctaContact: 'Kontakt oss',
    benefits: [
      { title: 'Se kandidater for fast ansettelse', desc: 'FÃ¥ oversikt over tilgjengelige kandidater og finn profiler som passer deres behov.' },
      { title: 'Inviter til intervju direkte', desc: 'Arbeidsgivere kan selv gÃ¥ gjennom profiler og invitere aktuelle kandidater til intervju.' },
      { title: 'Oversikt over sprÃ¥kforberedelse', desc: 'Se status i sprÃ¥k- og faglig forberedelse, slik at oppstarten kan planlegges tryggere.' },
      { title: 'Rask dialog med oss', desc: 'Portalen er koblet til rekrutteringsteamet vÃ¥rt for korte avklaringer underveis.' },
    ],
  },

  godeGrunner: {
    label: 'Et samarbeid som gir nye lÃ¸sninger',
    heading: 'Hva sier kommunene vi samarbeider med?',
    description: 'Mangelen pÃ¥ helsepersonell kombinert med sykefravÃ¦r og permisjoner gjÃ¸r det nÃ¸dvendig Ã¥ finne varige lÃ¸sninger pÃ¥ arbeidskraft for Ã¥ gi pasientene oppfÃ¸lgingen de trenger.',
    articleLink: '/nyheter/sor-fron-integrasjon',
    articleLinkLabel: 'Les artikkel',
    testimonials: [
      { quote: 'Vi har vÃ¦rt veldig fornÃ¸yd med to av vÃ¥re sykepleiere fra Spania. SprÃ¥ket var mye bedre enn forventet, og de passet godt inn hos oss.', author: 'Karin, Ã…mot kommune' },
      { quote: 'Vi fant en god lÃ¸sning med Ã¥ la en sykepleier jobbe i helsefagarbeider-stilling til hun var bedre i sprÃ¥ket. Tre-fire uker etterpÃ¥ var hun klar til Ã¥ jobbe fast som sykepleier hos oss.', author: 'Daniel, Kautokeino kommune' },
      { quote: 'Vi var veldig glade for Ã¥ fÃ¥ en sykepleier fra Italia som en del av teamet vÃ¥rt. Han lÃ¦rte seg sprÃ¥ket fort nÃ¥r han begynte Ã¥ jobbe.', author: 'Anne, Trondheim kommune' },
    ],
  },

  ctaBanner: {
    badge: 'Klar til Ã¥ starte?',
    heading: 'Finn riktig kompetanse for din virksomhet i dag',
    description: 'Vi kobler norske arbeidsgivere med kandidater som er sprÃ¥klig og faglig forberedt for trygg oppstart.',
    cta1: 'Kontakt oss nÃ¥',
    cta2: 'Se kandidater',
  },

  faq: {
    label: 'SpÃ¸rsmÃ¥l & svar',
    heading: 'Ofte stilte spÃ¸rsmÃ¥l',
    description: 'Finn svar pÃ¥ de vanligste spÃ¸rsmÃ¥lene om rekruttering og samarbeid med Global Working.',
    ctaText: 'Fant du ikke svaret? Kontakt oss',
    items: [
      { q: 'Hvor lang tid tar rekrutteringsprosessen?', a: 'Tidslinjen avhenger av valgt opplÃ¦ringslÃ¸p: fysisk (5 mÃ¥neder), hybrid (7 mÃ¥neder) eller fullt nettbasert (9 mÃ¥neder). Intervjuer med arbeidsgiver skjer normalt 1â€“4 uker etter opplÃ¦ring.' },
      { q: 'Hvilket sprÃ¥knivÃ¥ har kandidatene nÃ¥r de ankommer Norge?', a: 'Kandidatene fÃ¸lger et strukturert lÃ¸p med opptil 600 undervisningstimer i norsk, bransjespesifikk terminologi og innfÃ¸ring i norsk arbeidskultur. MÃ¥let settes ut fra rollekrav, ofte opp mot B2.' },
      { q: 'Hvilke sektorer dekker dere?', a: 'Vi rekrutterer primÃ¦rt til helse og omsorg, industri og bygg, samt utdanning og barneomsorg. Helsesektoren er vÃ¥rt spesialfelt, der vi har levert kvalifiserte sykepleiere siden 2015.' },
      { q: 'Hva koster det Ã¥ bruke Global Working?', a: 'Pris avhenger av behov og omfang. Vi gÃ¥r gjennom modell og priser i et uforpliktende kartleggingsmÃ¸te, slik at lÃ¸sningen tilpasses virksomheten deres.' },
      { q: 'Hvordan sikrer dere kvaliteten pÃ¥ kandidatene?', a: 'Vi kombinerer seleksjon, sprÃ¥kforberedelse og tett oppfÃ¸lging fÃ¸r oppstart. Teamet vÃ¥rt inkluderer bÃ¥de psykologer og sprÃ¥klÃ¦rere, og prosessene er ISO-sertifiserte.' },
      { q: 'Tilbyr dere oppfÃ¸lging etter ansettelse?', a: 'Ja. Vi fÃ¸lger opp kandidaten og arbeidsgiveren gjennom prÃ¸veperioden med ekstra sprÃ¥ktimer, stÃ¸tte med dokumentasjon og jevnlige samtalepunkter for Ã¥ sikre en vellykket integrering.' },
    ],
  },

  navbar: {
    links: [
      { label: 'VÃ¥r rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
      { label: 'Helsesektor', href: '/helse' },
      { label: 'Nyheter', href: '/nyheter' },
      { label: 'Talentportalen', href: '/talentportalen' },
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
    ctaLabel: 'Kom i gang',
  },

  footer: {
    description: 'Rekruttering og sprÃ¥kopplÃ¦ring for kvalifiserte fagfolk til det norske arbeidsmarkedet, med strukturert oppfÃ¸lging fra fÃ¸rste kontakt til oppstart.',
    social: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/globalworking-norge' },
      { label: 'Instagram', href: 'https://www.instagram.com/globalworkingnorge' },
    ],
    links: {
      Tjenester: [
        { label: 'VÃ¥r rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
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
    heading: 'Ã˜nsker du Ã¥ vite mer?',
    description: 'Du treffer oss pÃ¥ e-post eller telefon, eller ved Ã¥ fylle ut skjemaet under. Vi tar kontakt sÃ¥ snart vi har mulighet.',
    officeTitle: 'Hovedkontor Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, EspaÃ±a',
  },

  legalPersonvern: {
    breadcrumb: 'Personvern',
    title: 'PersonvernerklÃ¦ring',
    intro: 'Denne siden forklarer hvilke personopplysninger vi behandler, hvorfor vi gjÃ¸r det og hvilke rettigheter du har.',
    blocks: [
      {
        heading: 'Hvem er behandlingsansvarlig?',
        body: 'Global Working Norge AS er behandlingsansvarlig for personopplysninger som samles inn via dette nettstedet.',
      },
      {
        heading: 'Hvilke opplysninger vi behandler',
        body: 'Vi kan behandle kontaktinformasjon, henvendelser sendt via skjema, og tekniske data som IP-adresse, nettleser og bruksmÃ¸nster.',
      },
      {
        heading: 'FormÃ¥l og rettslig grunnlag',
        body: 'Opplysninger behandles for Ã¥ besvare henvendelser, levere tjenester, forbedre nettstedet og oppfylle lovpÃ¥lagte krav.',
      },
      {
        heading: 'Lagring og deling',
        body: 'Personopplysninger lagres ikke lenger enn nÃ¸dvendig. Vi kan dele data med databehandlere som leverer drift, analyse eller kommunikasjonstjenester.',
      },
      {
        heading: 'Dine rettigheter',
        body: 'Du kan be om innsyn, retting, sletting, begrensning eller dataportabilitet, og protestere pÃ¥ behandling der det er relevant.',
      },
    ],
  },

  legalVilkar: {
    breadcrumb: 'VilkÃ¥r',
    title: 'VilkÃ¥r for bruk',
    intro: 'Disse vilkÃ¥rene regulerer bruk av nettstedet og relaterte tjenester fra Global Working Norge.',
    blocks: [
      {
        heading: 'Generelt',
        body: 'Ved Ã¥ bruke dette nettstedet aksepterer du disse vilkÃ¥rene. Dersom du ikke aksepterer vilkÃ¥rene, ber vi deg avstÃ¥ fra bruk.',
      },
      {
        heading: 'Innhold og immaterielle rettigheter',
        body: 'Alt innhold pÃ¥ nettstedet tilhÃ¸rer Global Working Norge eller vÃ¥re lisensgivere, med mindre annet er oppgitt.',
      },
      {
        heading: 'Ansvarsbegrensning',
        body: 'Vi tilstreber korrekt og oppdatert informasjon, men kan ikke garantere at alt innhold alltid er feilfritt. Bruk av nettstedet skjer pÃ¥ eget ansvar.',
      },
      {
        heading: 'Lenker til tredjepart',
        body: 'Nettstedet kan inneholde lenker til eksterne nettsteder. Vi er ikke ansvarlige for innhold eller praksis pÃ¥ slike nettsteder.',
      },
      {
        heading: 'Endringer i vilkÃ¥r',
        body: 'Vi kan oppdatere vilkÃ¥rene ved behov. Oppdatert versjon publiseres pÃ¥ denne siden med virkning fra publiseringsdato.',
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
        body: 'Cookies er smÃ¥ tekstfiler som lagres i nettleseren din for Ã¥ fÃ¥ nettstedet til Ã¥ fungere, forbedre brukeropplevelsen og mÃ¥le bruk.',
      },
      {
        heading: 'Typer cookies vi bruker',
        body: 'Vi bruker nÃ¸dvendige cookies for grunnleggende funksjonalitet, samt valgfri statistikk/analytiske cookies nÃ¥r du samtykker.',
      },
      {
        heading: 'Samtykke og administrasjon',
        body: 'Du kan nÃ¥r som helst endre cookie-valg i nettleseren din eller ved Ã¥ oppdatere samtykket pÃ¥ nettstedet.',
      },
      {
        heading: 'Tredjepartscookies',
        body: 'Dersom analyseverktÃ¸y er aktivert, kan tredjepartsleverandÃ¸rer sette cookies i henhold til sine egne retningslinjer.',
      },
      {
        heading: 'Kontakt',
        body: 'Har du spÃ¸rsmÃ¥l om vÃ¥r bruk av cookies, kontakt oss pÃ¥ kontakt@globalworking.no.',
      },
    ],
  },
}

export default siteContent
