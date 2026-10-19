// 1:1 session types.
// Every session is 30 minutes. Short enough to leave room to spare inside any free call, and short
// enough that a request has to arrive specific to be worth booking. What separates the three types
// is what each one sets out to do, not how long it takes.
//
// The label — "RE: Anything" — is a name, not copy, so it reads the same in every language, the way
// "Pro Bono" and "1:1 / Schedule" do. Everything else about a session is written per language.
const types = [
  {
    id: 'intro',
    name: 'RE: Anything',
    short: 'Anything',
    minutes: 30,
    description: {
      en: 'A short, no-agenda hello — to hear where you are, and what might come next.',
      ru: 'Короткое знакомство без повестки дня — услышать, где вы сейчас и что может быть дальше.',
      be: 'Кароткае знаёмства без парадку дня — пачуць, дзе вы цяпер і што можа быць далей.'
    },
    confirmation: {
      en: 'Come as you are. Nothing needs polishing — the rough version is usually the honest one.',
      ru: 'Приходите как есть. Ничего не нужно начищать — черновая версия обычно честнее.',
      be: 'Прыходзьце як ёсць. Нічога не трэба наводзіць — чарнавы варыянт звычайна шчырэйшы.'
    },
    bring: {
      en: [
        'A problem you can’t quite name yet',
        'A question you want a straight answer to',
        'A hunch that something in the process is off'
      ],
      ru: [
        'Проблема, которую ещё трудно назвать',
        'Вопрос, на который нужен прямой ответ',
        'Ощущение, что в процессе что-то не так'
      ],
      be: [
        'Праблема, якую яшчэ цяжка назваць',
        'Пытанне, на якое патрэбны прамы адказ',
        'Адчуванне, што ў працэсе нешта не так'
      ]
    },
    build: {
      en: [
        'An honest read on whether I can help',
        'A name for the thing that’s been bugging you',
        'A clear next step — with me or without',
        'The confidence to keep going and stay on track'
      ],
      ru: [
        'Честный ответ, могу ли я помочь',
        'Название для того, что вас давно грызёт',
        'Понятный следующий шаг — со мной или без',
        'Уверенность продолжать и не сходить с курса'
      ],
      be: [
        'Шчыры адказ, ці магу я дапамагчы',
        'Назва для таго, што вас даўно грызе',
        'Зразумелы наступны крок — са мной ці без',
        'Упэўненасць працягваць і не збочваць з курсу'
      ]
    }
  },
  {
    id: 'career',
    name: 'RE: Career',
    short: 'Career',
    minutes: 30,
    description: {
      en: 'Your résumé, your portfolio, and the story they’re not telling yet.',
      ru: 'Ваше резюме, портфолио и история, которую они ещё не рассказывают.',
      be: 'Ваша рэзюмэ, партфоліо і гісторыя, якую яны яшчэ не расказваюць.'
    },
    confirmation: {
      en: 'You’re not behind. You’re carrying a good story in the wrong order.',
      ru: 'Вы не отстали. Вы просто несёте хорошую историю в неправильном порядке.',
      be: 'Вы не адсталі. Вы проста нясеце добрую гісторыю ў няправільным парадку.'
    },
    bring: {
      en: [
        'A résumé that isn’t landing interviews',
        'A portfolio that undersells the work',
        'A fork in the road — stay, switch, or go it alone'
      ],
      ru: [
        'Резюме, которое не приводит на собеседования',
        'Портфолио, которое недооценивает вашу работу',
        'Развилка — остаться, сменить или идти одному'
      ],
      be: [
        'Рэзюмэ, якое не прыводзіць на сумоўі',
        'Партфоліо, якое недаацэньвае вашу працу',
        'Раздарожжа — застацца, змяніць ці ісці аднаму'
      ]
    },
    build: {
      en: [
        'A sharper story and positioning',
        'A résumé that reads the way you mean it to',
        'A portfolio that leads the way you wish',
        'The confidence to ask for more without excuse'
      ],
      ru: [
        'Более острая история и позиционирование',
        'Резюме, которое читается так, как вы задумали',
        'Портфолио, которое ведёт так, как вам хочется',
        'Уверенность просить больше без оправданий'
      ],
      be: [
        'Больш вострая гісторыя і пазіцыянаванне',
        'Рэзюмэ, якое чытаецца так, як вы задумалі',
        'Партфоліо, якое вядзе так, як вам хочацца',
        'Упэўненасць прасіць больш без апраўданняў'
      ]
    }
  },
  {
    id: 'work',
    name: 'RE: Business',
    short: 'Business',
    minutes: 30,
    description: {
      en: 'Your products, your programs, your tools, and the value you’re willing to deliver.',
      ru: 'Ваши продукты, программы, инструменты и ценность, которую вы готовы дать.',
      be: 'Вашы прадукты, праграмы, інструменты і каштоўнасць, якую вы гатовы даць.'
    },
    confirmation: {
      en: 'You’ve been holding this one alone long enough. Let’s put it on the table.',
      ru: 'Вы держите это в одиночку уже достаточно долго. Давайте выложим это на стол.',
      be: 'Вы трымаеце гэта ў адзіноце ўжо дастаткова доўга. Давайце выкладзем гэта на стол.'
    },
    bring: {
      en: [
        'A launch that keeps slipping',
        'A scope that’s grown out of control',
        'A team that’s busy but not shipping',
        'A plan that doesn’t survive contact with reality'
      ],
      ru: [
        'Запуск, который постоянно сдвигается',
        'Объём, вышедший из-под контроля',
        'Команда занята, но ничего не выпускает',
        'План, который не выдерживает встречи с реальностью'
      ],
      be: [
        'Запуск, які пастаянна зрушваецца',
        'Аб’ём, што выйшаў з-пад кантролю',
        'Каманда занятая, але нічога не выпускае',
        'План, які не вытрымлівае сустрэчы з рэальнасцю'
      ]
    },
    build: {
      en: [
        'A deep dive into the root cause underlying the problem',
        'A discussion on the trade-offs of decisions made',
        'A clearer vision for the next move, and what it unlocks',
        'The confidence to adapt and face reality with eyes open'
      ],
      ru: [
        'Глубокое погружение в первопричину, лежащую в основе проблемы',
        'Разговор о компромиссах принятых решений',
        'Более ясное видение следующего шага и того, что он открывает',
        'Уверенность адаптироваться и смотреть реальности в глаза'
      ],
      be: [
        'Глыбокае пагружэнне ў першапрычыну, што ляжыць у аснове праблемы',
        'Размова пра кампрамісы прынятых рашэнняў',
        'Больш яснае бачанне наступнага кроку і таго, што ён адкрывае',
        'Упэўненасць адаптавацца і глядзець рэальнасці ў вочы'
      ]
    }
  }
];

// One language's view of the types. `audience` is the label the page reads and `name` is the label
// the emails carry — both spread from the single string above, so they can only ever agree.
export const sessionTypesFor = (locale) =>
  types.map((t) => ({
    ...t,
    audience: t.name,
    description: t.description[locale] ?? t.description.en,
    confirmation: t.confirmation[locale] ?? t.confirmation.en,
    bring: t.bring[locale] ?? t.bring.en,
    build: t.build[locale] ?? t.build.en
  }));

// English, for the places that are not a page: the request API, the /me table, the footer's list of
// labels. Anyone reading the site gets sessionTypesFor(locale) instead.
export const sessionTypes = sessionTypesFor('en');

// Weekly availability in the owner's timezone (0 = Sun … 6 = Sat → "HH:MM" starts).
const everyDay = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export const availability = {
  timezone: 'Europe/Minsk',
  minNoticeHours: 24,
  week: {
    0: everyDay,
    1: everyDay,
    2: everyDay,
    3: everyDay,
    4: everyDay,
    5: everyDay,
    6: everyDay
  }
};

export const findSessionType = (id) => sessionTypes.find((t) => t.id === id) || null;
