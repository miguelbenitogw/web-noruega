import { IMAGES } from '../assets/images'

// Contenido central de toda la web. Edita desde /admin.
const siteContent = {
  hero: {
    badge: 'Norges ledende rekrutteringspartner',
    h1First: 'Har dere behov for',
    h1Highlight: 'arbeidskraft?',
    description: 'Global Working er verdens største språkskole som underviser i norsk utenfor Skandinavia. Vi spesialiserer oss på norsk språk- og kulturopplæring for søreuropeiske fagfolk, og kobler dem med arbeidsgivere i Norge. Vi følger kandidatene fra første norsktime til trygg oppstart i jobb.',
    imageUrl: IMAGES.teamHero,
    imageAlt: 'Global Working-teamet i en lys og profesjonell situasjon',
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
    label: 'Våre tjenester',
    heading: 'Vårt tilbud til norske arbeidsgivere',
    description: 'Vi kobler norske arbeidsgivere med kvalifiserte fagfolk fra Sør-Europa – forberedt med språk, kultur og fagkompetanse.',
    readMoreLabel: 'Les mer',
    sections: [
      { title: 'Vår rekrutteringsmodell', description: 'Vi finner, forbereder og følger opp fagfolk fra Sør-Europa til trygg oppstart i Norge. Opptil 600 timer norskopplæring.', href: '/vr-rekrutteringsmodell' },
      { title: 'Helsesektor', description: 'Norges største leverandør av sykepleiere utenfra Skandinavia. Spesialisert helsefaglig forberedelse siden 2014.', href: '/helse' },
      { title: 'Talentportalen', description: 'Se tilgjengelige kandidater for fast ansettelse direkte i vår nye kandidatportal.', href: '/talentportalen' },
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
    heading: 'Vi støtter det norske helsevesenet',
    description: 'Global Working er den største leverandøren av sykepleiere utenfra Skandinavia til Norge. Siden 2014 har vi spesialisert oss på å utdanne og kvalifisere sykepleiere fra Spania, Italia og Frankrike for arbeid i norsk helsesektor.',
    imageUrl: IMAGES.homeMetricsTeam,
    imageAlt: 'Global Working-teamet i møte med norske arbeidsgivere',
    cta: 'Les mer om helse',
  },

  homeContact: {
    label: 'Kontakt',
    heading: 'Ønsker du å vite mer?',
    description: 'Du treffer oss på e-post eller telefon. Vi tar kontakt så snart vi har mulighet.',
    cta: 'Send oss en melding',
  },

  spanskAlicanteTeaser: {
    label: 'Nytt konsept i Alicante',
    heading: 'Bo gratis i Alicante med Spansk i Alicante',
    description: 'Bli en del av hverdagen hos Global Working i Spania. Du bidrar som samtaleassistent rundt 15 timer i uken og får bolig, sosialt miljø og internasjonal erfaring tilbake.',
    imageUrl: IMAGES.spanskAlicanteHeroSunset,
    imageAlt: 'Solnedgang ved stranden i Alicante',
    cta: 'Utforsk Spansk i Alicante',
  },

  spanskAlicantePage: {
    breadcrumb: 'Spansk i Alicante',
    heroTitle: 'Bo gratis i Alicante',
    heroSubtitle: 'Bli en del av hverdagen til Global Working i Spania',
    heroImageUrl: IMAGES.spanskAlicanteBeachPalms,
    heroImageAlt: 'Strand og palmer i Alicante',
    intro: 'Spansk i Alicante er en enkel måte å teste livet i Spania på, med bolig, mennesker og en hverdag allerede på plass. Du bor sammen med 2 til 3 spanske studenter som lærer norsk og bidrar sosialt i miljøet rundt skolen.',
    exchangeNote: 'Dette er en bytteordning, ikke en typisk jobb. Du bidrar rundt 15 timer i uken som samtaleassistent og får gratis bolig i Alicante.',
    roleImageUrl: IMAGES.spanskAlicantePromenade,
    roleImageAlt: 'Sosial hverdag og samtaler i Alicante',
    roleTitle: 'Hva gjør du som samtaleassistent?',
    roleItems: [
      'Ha samtaletimer eller språkkafé på norsk',
      'Være litt lærerassistent i undervisning',
      'Delta i lunsj med elevene',
      'Hjelpe med CV og søknader',
      'Arrangere små sosiale aktiviteter',
    ],
    benefitsTitle: 'Hva får du?',
    benefitsItems: [
      'Gratis bolig i Alicante sammen med spanjoler',
      'Et sosialt miljø fra dag én',
      'Internasjonal erfaring',
      'En hverdag med struktur og frihet',
      'Erfaring som er relevant å ha på CV',
    ],
    weekTitle: 'Hvordan ser en vanlig uke ut?',
    weekItems: [
      'Ca 13 timer bidrag på skolen',
      '2 timer lunsj og sosial tid med elevene',
      'Resten av tiden og helgene er fri',
      'Mange kombinerer med spanskkurs, studier på nett eller deltidsjobb',
    ],
    testimonialQuote: 'Det har vært en sann glede å ha vært i Alicante sammen med Global Working. Jeg har fått gode venner, praktisert mye spansk og hatt stor frihet i samtaletimene.',
    testimonialAuthor: 'Oliver Payne, samtaleassistent vår 2026',
    spanishCourseTitle: 'Spanskkurs',
    spanishCourseItems: [
      '2 til 15 timer i uken',
      'Du velger nivå og intensitet selv',
      'Kursene betales av deg',
    ],
    fitTitle: 'Hvem passer dette for?',
    fitItems: [
      'Deg som har friår',
      'Deg som studerer på nett',
      'Deg som vil teste livet i Spania uten for mye risiko',
      'Deg som vil lære spansk i praksis',
      'Deg som vil ha en sosial hverdag, ikke bare et opphold',
    ],
    cityTitle: 'Litt om livet i Alicante',
    cityImageUrl: IMAGES.spanskAlicanteCityView,
    cityImageAlt: 'Byliv og utsikt i Alicante',
    cityItems: [
      'Strand og promenade',
      'Mange unge og studenter',
      'Kafeer, restauranter og uteliv',
      'Lett å bli kjent med folk',
    ],
    socialTitle: 'Følg hverdagen',
    socialInstagram: 'Instagram: Spansk i Alicante',
    socialTikTok: 'TikTok: Spansk i Alicante',
    instagramUrl: 'https://www.instagram.com/globalworking',
    tiktokUrl: 'https://www.tiktok.com/@globalworking',
    processTitle: 'Klar for å teste livet i Spania?',
    processSteps: [
      'Send inn interesse',
      'Kort prat med oss',
      'Vi ser om dette passer for deg',
      'Klar for Alicante',
    ],
    ctaPrimary: 'Søk nå!',
    ctaSecondary: 'Send oss en melding',
    visionLinkLabel: 'Les hvorfor Spansk i Alicante finnes',
  },

  spanskAlicanteVision: {
    breadcrumb: 'Hvorfor finnes Spansk i Alicante?',
    title: 'Hvorfor finnes Spansk i Alicante?',
    imageUrl: IMAGES.spanskAlicanteCastleArch,
    imageAlt: 'Historisk arkitektur og stemning i Alicante',
    intro: 'Spansk i Alicante er en viktig del av hvordan vi forbereder sykepleiere fra Sør-Europa på et liv og en jobb i Norge. Språk alene er ikke nok. Det som ofte mangler er det som skjer mellom linjene i hverdagen.',
    sections: [
      {
        heading: 'Din rolle i det',
        body: 'Som samtaleassistent blir du en naturlig del av læringsprosessen. Gjennom samtaler, lunsj og sosiale initiativ gjør du språket levende og gir deltakerne et første møte med norsk kultur og kommunikasjon.',
      },
      {
        heading: 'Hva får du igjen?',
        body: 'Du blir en del av et sosialt miljø fra start, bor sammen med deltakere og bygger relasjoner på tvers av språk og kultur. Oppholdet gir perspektiv, internasjonal erfaring og praktisk språkbruk.',
      },
    ],
    highlights: [
      'Innsikt i en annen kultur på nært hold',
      'Mulighet til å lære språk i praksis',
      'Erfaring som er relevant både personlig og profesjonelt',
    ],
  },

  contacts: [
    { name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', email: 'miriam.svendsen@globalworking.net', phone: '+47 919 00 649', imageUrl: IMAGES.contactMiriam, imageAlt: 'Miriam Svendsen' },
    { name: 'Gro Anette', role: 'Kandidatoppfølging', email: 'gro.anette@globalworking.net', phone: '+47 408 98 448', imageUrl: IMAGES.contactGro, imageAlt: 'Gro Anette' },
  ],

  rekrutteringHero: {
    breadcrumb: 'Vår rekrutteringsmodell',
    h1: 'Hva gjør Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og følger prosessen helt frem til trygg oppstart.',
  },

  rekrutteringCollab: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyrå. Vi forbereder kandidatene gjennom strukturert opplæring. Deretter ansetter dere kandidaten direkte – uten mellomledd.',
    p2: 'Samarbeidet starter med en uforpliktende kartlegging av ditt behov. Vi presenterer så kvalifiserte kandidater som matcher kravene dere har satt.',
    p3: 'Gjennom vår nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    imageUrl: IMAGES.teamGroup,
    imageAlt: 'Global Working rekrutteringsmodell',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  helseHero: {
    breadcrumb: 'Helsesektor',
    h1: 'Tjenester for helseinstitusjoner',
    description: 'Vi forbereder helsepersonell for den norske helsesektoren – fra språkopplæring til trygg oppstart i jobb.',
    imageUrl: IMAGES.enfermeria,
    imageAlt: 'Helsepersonell i opplæring gjennom Global Working',
  },

  helsePhases: {
    label: 'Rekrutteringsprosessen',
    heading: 'Slik rekrutterer vi sykepleiere til Norge',
    description: 'Prosessen vår er delt inn i tre tydelige faser, slik at kandidatene er godt forberedt før oppstart i jobb.',
    phases: [
      {
        number: '01',
        title: 'Språk og faglig forberedelse',
        description: 'Kandidatene gjennomfører opptil 600 undervisningstimer i norsk, helseterminologi og praktisk språkbruk i kliniske situasjoner.\n\nUndervisningen dekker alt fra dagligdagse samtaler til faglig dokumentasjon og kommunikasjon med pasienter og kollegaer. Kandidatene øver på reelle situasjoner fra norsk helsevesen slik at de er klare for arbeidslivet fra første dag.',
        formats: [
          { label: 'Fysisk i Alicante', duration: '5 måneder' },
          { label: 'Kombinasjon fysisk og nett', duration: '7 måneder' },
          { label: 'Full nettbasert opplæring', duration: '9 måneder' },
        ],
      },
      {
        number: '02',
        title: 'Strukturert overgang til jobb',
        description: '1–4 uker etter avsluttet opplæring gjennomføres intervju med arbeidsgiver. Vi koordinerer oppstart og avreisedato med begge parter.',
        formats: null,
      },
      {
        number: '03',
        title: 'Ekstra oppfølging ved behov',
        description: 'Ved behov tilrettelegger vi individuell språktrening før og etter avreise. Vi kjører 17–20 opplæringsgrupper årlig for å sikre kontinuitet.',
        formats: null,
      },
    ],
  },

  helsePartnership: {
    label: 'Samarbeidsmodell',
    heading: 'Slik samarbeider vi med dere',
    p1: 'Global Working er ikke et bemanningsbyrå. Vi forbereder kandidatene gjennom strukturert opplæring. Deretter ansetter dere kandidaten direkte – uten mellomledd.',
    p2: 'Gjennom vår nye kandidatportal kan arbeidsgivere selv se tilgjengelige kandidater og invitere til intervju.',
    cta1: 'Kontakt oss',
    cta2: 'Se kandidatportalen',
  },

  omOssHero: {
    breadcrumb: 'Om oss',
    h1: 'Om oss',
    description: 'Global Working er en spesialisert aktør innen språkopplæring og internasjonal rekruttering.',
  },

  omOssTeam: {
    label: 'Vårt team',
    heading: 'Møt teamet i Global Working',
    description: 'Vårt flerfaglige team av psykologer, språklærere og rekrutteringsspesialister sikrer en helhetlig prosess – fra utvelgelse og opplæring til oppfølging i Norge.',
    members: [
      { initials: 'PS', name: 'Pablo Santamarina', role: 'CEO & Grunnlegger', hasImage: true, imageUrl: IMAGES.ceoPhoto, imageAlt: 'Pablo Santamarina' },
      { initials: 'MS', name: 'Miriam Svendsen', role: 'Rekrutteringsansvarlig', hasImage: false, imageUrl: IMAGES.contactMiriam, imageAlt: 'Miriam Svendsen' },
      { initials: 'GA', name: 'Gro Anette', role: 'Kandidatoppfølging', hasImage: false, imageUrl: IMAGES.contactGro, imageAlt: 'Gro Anette' },
      { initials: 'T', name: 'Teamet', role: '50+ ansatte i Alicante og Oslo', hasImage: false },
    ],
  },

  omOssOffices: {
    label: 'Lokasjon',
    heading: 'Våre kontorer',
    description: 'Global Working har hovedkontor i Alicante, Spania, med kontor i Oslo.',
    imageUrl: IMAGES.alicanteOffice,
    imageAlt: 'Global Working-kontoret i Alicante',
    officeName: 'Hovedkontor – Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, España',
  },

  talentportalenHero: {
    breadcrumb: 'Talentportalen',
    h1: 'Kandidatportal for arbeidsgivere',
    description: 'Se tilgjengelige kandidater og inviter til intervju direkte gjennom vår nye plattform.',
  },

  talentportalenSteps: {
    label: 'Steg for steg',
    heading: 'Slik bruker du portalen',
    steps: [
      { number: '01', title: 'Opprett konto', desc: 'Ta kontakt med oss for å få tilgang til kandidatportalen.' },
      { number: '02', title: 'Bla gjennom kandidater', desc: 'Se profiler, språknivå, fagbakgrunn og tilgjengelighet.' },
      { number: '03', title: 'Inviter til intervju', desc: 'Velg kandidater som passer og inviter dem direkte til intervju.' },
      { number: '04', title: 'Ansett direkte', desc: 'Dere ansetter kandidaten direkte – uten mellomledd.' },
    ],
  },

  talentportalenBenefits: {
    label: 'Hvorfor portalen',
    heading: 'Fordeler med kandidatportalen',
    items: [
      'Sanntidsoversikt over tilgjengelige kandidater',
      'Detaljerte profiler med språknivå og erfaring',
      'Direkte kommunikasjon med rekrutteringsteamet',
      'Gratis tilgang for arbeidsgivere som samarbeider med oss',
    ],
  },

  kontaktHero: {
    breadcrumb: 'Kontakt',
    h1: 'Kontakt oss',
    description: 'Vi er tilgjengelige for spørsmål om rekruttering, samarbeid og kandidatportal. Ta kontakt – vi svarer normalt innen 1 virkedag.',
  },

  nyheterHero: {
    breadcrumb: 'Nyheter',
    h1: 'Nyheter & Artikler',
    description: 'Følg med på siste nytt fra Global Working – artikler, oppdateringer og historier fra vårt arbeid med rekruttering og språkopplæring.',
  },

  hvaGjor: {
    label: 'Vår prosess',
    heading: 'Hva gjør Global Working?',
    description: 'Vi finner og presenterer de mest relevante menneskene til din virksomhet, og følger prosessen helt frem til trygg oppstart.',
    services: [
      { title: 'Rekrutterer kompetanse', description: 'Vi rekrutterer kompetansen dere trenger innen flere sektorer, blant annet helse og omsorg, industri og bygg, samt utdanning og barneomsorg.' },
      { title: 'Sørger for ønsket språknivå', description: 'Vi underviser fra ingen forkunnskaper til opptil B2-nivå, og tilpasser språk, rolle og arbeidshverdag til målene dere har satt.' },
      { title: 'Trygg oppstart i Norge', description: 'Vi hjelper kandidatene gjennom hele prosessen med nødvendige dokumenter og riktig papirarbeid, med ekstra språktimer ved behov.' },
    ],
    ctaLabel: 'Book et møte med oss',
    ctaNote: 'Uforpliktende kartlegging av behov',
  },

  rekrutteringComp: {
    label: 'Vår rekrutteringsmodell',
    heading: 'Slik rekrutterer vi fagfolk til Norge',
    p1: 'Våre kandidater kommer hovedsakelig fra Spania, Italia og Frankrike, og er motiverte fagpersoner som ønsker å jobbe i Norge over lengre tid eller etablere seg her på sikt.',
    p2: 'Undervisningen kan gjennomføres fysisk i Alicante (5 måneder), som kombinasjon av fysisk og nettbasert undervisning (7 måneder), eller fullt nettbasert (9 måneder).',
    imageUrl: IMAGES.teamHero,
    imageAlt: 'Global Working rekrutteringsmodell',
    sectors: ['Helse og omsorg', 'Industri og bygg', 'Utdanning', 'Barneomsorg'],
    badge: 'Strukturert modell siden 2014',
    steps: [
      { title: 'Rekrutterer kompetansen du trenger', description: 'Vi kartlegger kompetanse, motivasjon og ønsker før kandidatene presenteres for arbeidsgiver.' },
      { title: 'Språk og faglig forberedelse', description: 'Alle kandidater følger et strukturert løp med opptil 600 timer norsk, bransjeterminologi og arbeidskultur.' },
      { title: 'Strukturert overgang', description: '1–4 uker etter opplæring gjennomføres intervju med arbeidsgivere, og oppstart og avreisedato avtales.' },
      { title: 'Ekstra oppfølging ved behov', description: 'Ved behov tilrettelegger vi individuelt opplegg med ekstra språktrening før eller etter avreise.' },
    ],
  },

  helsesektorComp: {
    label: 'Tjenester for helseinstitusjoner',
    heading: 'Vi forbereder helsepersonell for den norske helsesektoren',
    description: 'Global Working er den største leverandøren av sykepleiere utenfor Skandinavia til Norge. Siden 2014 har vi spesialisert oss på å utdanne og kvalifisere sykepleiere for arbeid i norsk helsesektor.',
    imageUrl: IMAGES.enfermeria,
    imageAlt: 'Helsepersonell i opplæring gjennom Global Working',
    stats: [
      { value: '10+ år', label: 'erfaring i Norge' },
      { value: '25 000+', label: 'undervisningstimer i norsk' },
      { value: '600', label: 'timer opplæring (opptil)' },
    ],
    features: [
      { title: 'Språk og faglig forberedelse før ansettelse', description: 'Kandidatene får opptil 600 undervisningstimer i norsk, helseterminologi og praktisk språkbruk i kliniske situasjoner.' },
      { title: 'Tre opplæringsmodeller', description: 'Fysisk i Alicante (5 måneder), kombinasjon fysisk og nett (7 måneder), eller full nettbasert opplæring (9 måneder).' },
      { title: 'Strukturert overgang til arbeidsgiver', description: 'Intervju skjer 1–4 uker etter avsluttet opplæring. Vi koordinerer oppstart og avreisedato med begge parter.' },
      { title: 'Ekstra oppfølging ved behov', description: 'Vi kan tilrettelegge individuell språktrening før og etter avreise for å redusere usikkerhet i oppstarten.' },
    ],
    groupsValue: '17–20',
    groupsLabel: 'grupper årlig',
    ctaLabel: 'Be om kandidater',
  },

  omOssComp: {
    label: 'Om oss',
    heading: 'Hvem er Global Working?',
    p1: 'Global Working er en spesialisert aktør innen språkopplæring og internasjonal rekruttering i Europa. Vi forbereder kandidater før ansettelse, slik at arbeidsgivere får medarbeidere og grunnlag for varige ansettelser.',
    p2: 'Global Working ble etablert i 2014 med mål om å gjøre det enklere for fagpersoner å bevege seg i det europeiske arbeidsmarkedet. I dag kombinerer vi rekruttering, språkopplæring og tett oppfølging for å sikre forutsigbare og bærekraftige ansettelser.',
    blockquote: { text: 'For oss handler internasjonal rekruttering ikke bare om å fylle en stilling. Det handler om å forberede mennesker grundig, slik at både arbeidsgiver og kandidat får en trygg start og et langsiktig samarbeid.', author: 'Pablo, CEO Global Working' },
    teamImageUrl: IMAGES.teamGroup,
    teamImageAlt: 'Global Working-teamet',
    officeImageUrl: IMAGES.oficina,
    officeImageAlt: 'Global Working-kontor',
    stats: [
      { value: '2014', label: 'Etablert' },
      { value: '50', label: 'Ansatte' },
      { value: 'ISO', label: 'Sertifisert' },
    ],
    locationLabel: 'Alicante',
    locationSub: 'Hovedkontor med kontor i Oslo',
    values: [
      { title: 'Seleksjon med faglig vurdering', desc: '25 % av teamet er psykologer som jobber med seleksjon, vurdering og oppfølging av kandidater.' },
      { title: 'Yrkesrettet språkopplæring', desc: '55 % av teamet er språklærere med spesialisering i yrkesrettet språkopplæring.' },
      { title: 'Kvalitetssikret prosess', desc: 'Vi er ISO-sertifisert for språkundervisning og internasjonal rekruttering i Europa.' },
    ],
  },

  talentportalenComp: {
    label: 'Talentportalen',
    heading: 'Ny kandidatportal for arbeidsgivere',
    description: 'Global Working har fått ny kandidatportal. Nå kan du selv gå inn og se hvilke kandidater vi har tilgjengelig for fast ansettelse.',
    portalUrl: 'https://globalworking-talentportal.lovable.app',
    ctaLogin: 'Logg inn på portalen',
    ctaContact: 'Kontakt oss',
    benefits: [
      { title: 'Se kandidater for fast ansettelse', desc: 'Få oversikt over tilgjengelige kandidater og finn profiler som passer deres behov.' },
      { title: 'Inviter til intervju direkte', desc: 'Arbeidsgivere kan selv gå gjennom profiler og invitere aktuelle kandidater til intervju.' },
      { title: 'Oversikt over språkforberedelse', desc: 'Se status i språk- og faglig forberedelse, slik at oppstarten kan planlegges tryggere.' },
      { title: 'Rask dialog med oss', desc: 'Portalen er koblet til rekrutteringsteamet vårt for korte avklaringer underveis.' },
    ],
  },

  godeGrunner: {
    label: 'Gode grunner til å samarbeide med oss',
    heading: 'Kommuner som lykkes med langsiktig rekruttering',
    description: 'Mangel på helsepersonell krever varige løsninger. Vi kombinerer rekruttering, språk og tett oppfølging slik at både arbeidsgiver og kandidat får en trygg start.',
    imageUrl: IMAGES.teamHero,
    imageAlt: 'Global Working samarbeid med norske kommuner',
    articleLink: '/om-oss',
    articleLinkLabel: 'Les mer om oss',
    testimonials: [
      { quote: 'Vi har vært veldig fornøyd med to av våre sykepleiere fra Spania. Språket var mye bedre enn forventet, og de passet godt inn hos oss.', author: 'Karin, Åmot kommune' },
      { quote: 'Vi fant en god løsning med å la en sykepleier jobbe i helsefagarbeider-stilling til hun var bedre i språket. Tre-fire uker etterpå var hun klar til å jobbe fast som sykepleier hos oss.', author: 'Daniel, Kautokeino kommune' },
      { quote: 'Vi var veldig glade for å få en sykepleier fra Italia som en del av teamet vårt. Han lærte seg språket fort når han begynte å jobbe.', author: 'Anne, Trondheim kommune' },
    ],
  },

  ctaBanner: {
    badge: 'Klar til å starte?',
    heading: 'Finn riktig kompetanse for din virksomhet i dag',
    description: 'Vi kobler norske arbeidsgivere med kandidater som er språklig og faglig forberedt for trygg oppstart.',
    imageUrl: IMAGES.peopleTeam2,
    imageAlt: 'Global Working-teamet i samarbeid',
    cta1: 'Kontakt oss nå',
    cta2: 'Se kandidater',
  },

  faq: {
    label: 'Spørsmål & svar',
    heading: 'Ofte stilte spørsmål',
    description: 'Finn svar på de vanligste spørsmålene om rekruttering og samarbeid med Global Working.',
    ctaText: 'Fant du ikke svaret? Kontakt oss',
    items: [
      { q: 'Hvor lang tid tar rekrutteringsprosessen?', a: 'Tidslinjen avhenger av valgt opplæringsløp: fysisk (5 måneder), hybrid (7 måneder) eller fullt nettbasert (9 måneder). Intervjuer med arbeidsgiver skjer normalt 1–4 uker etter opplæring.' },
      { q: 'Hvilket språknivå har kandidatene når de ankommer Norge?', a: 'Kandidatene følger et strukturert løp med opptil 600 undervisningstimer i norsk, bransjespesifikk terminologi og innføring i norsk arbeidskultur. Målet settes ut fra rollekrav, ofte opp mot B2.' },
      { q: 'Hvilke sektorer dekker dere?', a: 'Vi rekrutterer primært til helse og omsorg, industri og bygg, samt utdanning og barneomsorg. Helsesektoren er vårt spesialfelt, der vi har levert kvalifiserte sykepleiere siden 2015.' },
      { q: 'Hva koster det å bruke Global Working?', a: 'Pris avhenger av behov og omfang. Vi går gjennom modell og priser i et uforpliktende kartleggingsmøte, slik at løsningen tilpasses virksomheten deres.' },
      { q: 'Hvordan sikrer dere kvaliteten på kandidatene?', a: 'Vi kombinerer seleksjon, språkforberedelse og tett oppfølging før oppstart. Teamet vårt inkluderer både psykologer og språklærere, og prosessene er ISO-sertifiserte.' },
      { q: 'Tilbyr dere oppfølging etter ansettelse?', a: 'Ja. Vi følger opp kandidaten og arbeidsgiveren gjennom prøveperioden med ekstra språktimer, støtte med dokumentasjon og jevnlige samtalepunkter for å sikre en vellykket integrering.' },
    ],
  },

  navbar: {
    links: [
      { label: 'Vår rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
      { label: 'Helsesektor', href: '/helse' },
      { label: 'Spansk i Alicante', href: '/spansk-i-alicante' },
      { label: 'Nyheter', href: '/nyheter' },
      { label: 'Talentportalen', href: '/talentportalen' },
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
    ctaLabel: 'Kom i gang',
  },

  footer: {
    description: 'Rekruttering og språkopplæring for kvalifiserte fagfolk til det norske arbeidsmarkedet, med strukturert oppfølging fra første kontakt til oppstart.',
    copyright: 'Global Working Norge AS. Alle rettigheter forbeholdt.',
    bottomLinks: [
      { label: 'Personvern', href: '/personvern' },
      { label: 'Vilkår', href: '/vilkar' },
      { label: 'Informasjonskapsler', href: '/cookies' },
    ],
    social: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/globalworking-norge' },
      { label: 'Instagram', href: 'https://www.instagram.com/globalworkingnorge' },
    ],
    links: {
      Tjenester: [
        { label: 'Vår rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
        { label: 'Helsesektor', href: '/helse' },
        { label: 'Spansk i Alicante', href: '/spansk-i-alicante' },
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
    heading: 'Ønsker du å vite mer?',
    description: 'Du treffer oss på e-post eller telefon, eller ved å fylle ut skjemaet under. Vi tar kontakt så snart vi har mulighet.',
    imageUrl: IMAGES.alicanteOffice,
    imageAlt: 'Global Working-kontoret i Alicante',
    officeTitle: 'Hovedkontor Alicante',
    officeAddress: 'Carrer de Periodista Pirula Arderius, 4, 03001 Alicante, España',
    mapsLabel: 'Se i Google Maps',
    formTitle: 'Send oss en melding',
    formSubtitle: 'Vi svarer normalt innen 1 virkedag.',
    successTitle: 'Takk for henvendelsen!',
    successDescription: 'Vi kontakter deg innen 1 virkedag.',
    successReset: 'Send ny melding',
    submitLabel: 'Send melding',
    sendingLabel: 'Sender...',
  },

  legalPersonvern: {
    breadcrumb: 'Personvern',
    title: 'Personvernerklæring',
    intro: 'Denne siden forklarer hvilke personopplysninger vi behandler, hvorfor vi gjør det og hvilke rettigheter du har.',
    blocks: [
      {
        heading: 'Hvem er behandlingsansvarlig?',
        body: 'Global Working Norge AS er behandlingsansvarlig for personopplysninger som samles inn via dette nettstedet.',
      },
      {
        heading: 'Hvilke opplysninger vi behandler',
        body: 'Vi kan behandle kontaktinformasjon, henvendelser sendt via skjema, og tekniske data som IP-adresse, nettleser og bruksmønster.',
      },
      {
        heading: 'Formål og rettslig grunnlag',
        body: 'Opplysninger behandles for å besvare henvendelser, levere tjenester, forbedre nettstedet og oppfylle lovpålagte krav.',
      },
      {
        heading: 'Lagring og deling',
        body: 'Personopplysninger lagres ikke lenger enn nødvendig. Vi kan dele data med databehandlere som leverer drift, analyse eller kommunikasjonstjenester.',
      },
      {
        heading: 'Dine rettigheter',
        body: 'Du kan be om innsyn, retting, sletting, begrensning eller dataportabilitet, og protestere på behandling der det er relevant.',
      },
    ],
  },

  legalVilkar: {
    breadcrumb: 'Vilkår',
    title: 'Vilkår for bruk',
    intro: 'Disse vilkårene regulerer bruk av nettstedet og relaterte tjenester fra Global Working Norge.',
    blocks: [
      {
        heading: 'Generelt',
        body: 'Ved å bruke dette nettstedet aksepterer du disse vilkårene. Dersom du ikke aksepterer vilkårene, ber vi deg avstå fra bruk.',
      },
      {
        heading: 'Innhold og immaterielle rettigheter',
        body: 'Alt innhold på nettstedet tilhører Global Working Norge eller våre lisensgivere, med mindre annet er oppgitt.',
      },
      {
        heading: 'Ansvarsbegrensning',
        body: 'Vi tilstreber korrekt og oppdatert informasjon, men kan ikke garantere at alt innhold alltid er feilfritt. Bruk av nettstedet skjer på eget ansvar.',
      },
      {
        heading: 'Lenker til tredjepart',
        body: 'Nettstedet kan inneholde lenker til eksterne nettsteder. Vi er ikke ansvarlige for innhold eller praksis på slike nettsteder.',
      },
      {
        heading: 'Endringer i vilkår',
        body: 'Vi kan oppdatere vilkårene ved behov. Oppdatert versjon publiseres på denne siden med virkning fra publiseringsdato.',
      },
    ],
  },

  legalCookies: {
    breadcrumb: 'Cookies',
    title: 'Informasjonskapsler (cookies)',
    intro: 'Denne siden forklarer hvilke informasjonskapsler vi bruker, og hvordan du kan kontrollere eller trekke tilbake samtykke.',
    blocks: [
      {
        heading: 'Hva er cookies?',
        body: 'Cookies er små tekstfiler som lagres i nettleseren din for å få nettstedet til å fungere, forbedre brukeropplevelsen og måle bruk.',
      },
      {
        heading: 'Typer cookies vi bruker',
        body: 'Vi bruker nødvendige cookies for grunnleggende funksjonalitet, samt valgfri statistikk/analytiske cookies når du samtykker.',
      },
      {
        heading: 'Samtykke og administrasjon',
        body: 'Du kan når som helst endre cookie-valg i nettleseren din eller ved å oppdatere samtykket på nettstedet.',
      },
      {
        heading: 'Tredjepartscookies',
        body: 'Dersom analyseverktøy er aktivert, kan tredjepartsleverandører sette cookies i henhold til sine egne retningslinjer.',
      },
      {
        heading: 'Kontakt',
        body: 'Har du spørsmål om vår bruk av cookies, kontakt oss på kontakt@globalworking.no.',
      },
    ],
  },

  nyheterSection: {
    label: 'Nyheter & artikler',
    heading: 'Siste nytt fra Global Working',
    headingPreview: 'Siste nytt',
    ctaLabel: 'Se alle nyheter',
    imageUrl: IMAGES.platformHero,
    imageAlt: 'Global Working plattformvisning',
    loadingLabel: 'Laster nyheter...',
    readTimeSuffix: 'lesetid',
    readMoreLabel: 'Les mer',
    readArticleLabel: 'Les artikkel',
    backToNewsLabel: 'Tilbake til nyheter',
    relatedLabel: 'Relaterte nyheter',
    jumpToSectionLabel: 'Hopp til seksjon',
    notFoundTitle: 'Nyhet ikke funnet',
    notFoundDescription: 'Artikkelen finnes ikke eller er ikke publisert.',
    loadingTitle: 'Laster nyhet',
    loadingDescription: 'Henter publisert innhold...',
  },

  pageEndNav: {
    homeLabel: 'Hjem',
    backLabel: 'Tilbake til forsiden',
    contactLabel: 'Kontakt oss',
    sections: [
      { label: 'Rekrutteringsmodell', href: '/vr-rekrutteringsmodell' },
      { label: 'Helsesektor', href: '/helse' },
      { label: 'Nyheter', href: '/nyheter' },
      { label: 'Talentportalen', href: '/talentportalen' },
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },

  cookieConsent: {
    title: 'Vi bruker informasjonskapsler',
    description: 'Vi bruker informasjonskapsler for å forbedre opplevelsen på nettsiden vår. Ved å godta samtykker du til bruk av informasjonskapsler i samsvar med vår personvernerklæring.',
    acceptLabel: 'Godta alle',
    declineLabel: 'Avslå',
  },

  partners: {
    label: 'Samarbeidspartnere',
    heading: 'Vi jobber med',
    row1Alt: 'Partnere innen helse og rekruttering',
    row2Alt: 'Norske kommune- og helsepartnere',
    caption: 'Vi samarbeider med en rekke norske kommuner og helseforetak over hele landet.',
  },

  spanskAlicanteTeaserExtra: {
    secondaryCtaLabel: 'Les hvorfor det finnes',
    cardLabel: 'Alicante',
    cardText: 'Gratis bolig, sosialt miljø og en hverdag med struktur fra første dag.',
  },

  spanskAlicanteHvorfor: {
    sidebarHeading: 'Hva gir oppholdet deg?',
    backLabel: 'Tilbake til programmet',
  },
}

export default siteContent
