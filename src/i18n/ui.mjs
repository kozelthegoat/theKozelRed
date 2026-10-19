// The chrome, in every language the site speaks. Only the shared furniture lives here — nav,
// footer, buttons, page titles, and the notes and recommendations surfaces — because that is what
// changes when someone switches language.
//
// Missing keys fall back to English rather than rendering blank, so a half-finished translation
// degrades into the original language instead of into nothing.
export const ui = {
  en: {
    'nav.expertise': 'Expertise',
    'nav.experience': 'Experience',
    'nav.notes': 'Notes',
    'nav.contacts': 'Contacts',
    'a11y.language': 'Language',

    'cta.schedule': 'Schedule 1:1',
    'cta.resume': 'Download Résumé',
    'cta.donate': 'Donate',

    'footer.navigation': 'Navigation',
    'footer.proBono': 'Pro Bono',
    'footer.location': 'Location',
    // The schedule page's own title, so the footer names it the way the page does.
    'footer.schedule': '1:1 / Schedule',
    'footer.availability': 'Availability',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.contacts': 'Contacts',
    'footer.privacy': 'View Privacy',
    'footer.recommendations': 'Recommendations',
    'footer.notes': 'Notes',

    'notes.eyebrow': 'Notes',
    'notes.title': 'Notes',
    'notes.description': 'Notes and older thoughts, kept as they were written.',
    'notes.intro':
      'Older thoughts, kept as they were written — dated by when I had them, not by when they went up.',
    'notes.empty': 'Nothing published yet.',
    'notes.back': '← All notes',

    // Titles and descriptions, named once per page per language. Base resolves them from the path,
    // so the route files stay free of copy instead of each carrying their own English title.
    'page.home': 'Aliaksei Kozel — Strategy / Operations / Production',
    'page.home.description': 'Aliaksei Kozel — Strategy / Operations / Production.',
    'page.schedule': 'Aliaksei Kozel — 1:1 / Schedule',
    'page.schedule.description':
      'Book a free 30-minute 1:1 with Aliaksei Kozel — strategy, operations and production, from scope to ship.',
    'page.recommendations': 'Aliaksei Kozel — Recommendations',
    'page.recommendations.description':
      'What colleagues and clients have said about working with Aliaksei Kozel.',
    'page.privacy': 'Aliaksei Kozel — Privacy',
    'page.privacy.description': 'What this site stores, and what it doesn’t.',

    // Page copy. Each page's strings live under its own section, so a page can be translated whole
    // rather than half — which is what happened when only the layout's chrome was in here.
    'reco.eyebrow': 'Recommendations',
    'reco.title': 'In their words',
    'reco.intro':
      'None of this is my own writing. It’s theirs, and it makes the case better than I could. My thanks to each of them.',
    'reco.bullet': 'Recommendation {n} of {total}, {author}',
    // The toggle on a translated quote. The language after the dot names what you get by pressing.
    'reco.seeOriginal': 'See original · English',
    'reco.seeTranslation': 'See translation',

    // The schedule page, including the strings the browser writes after a click.
    'sched.eyebrow': 'Pro Bono',
    'sched.title': '1:1 / Schedule',
    'sched.intro1': 'You’re welcome to pick a session type, a date, a time, and any context to share.',
    'sched.intro2': 'I’ll see what’s on my plate, and come back to you either way.',
    'sched.tag.free': 'Free',
    'sched.tag.volunteering': 'Volunteering',
    'sched.tag.nostrings': 'No strings',
    'sched.sessions': 'Sessions',
    'sched.sessions.title': 'What you bring, what we build',
    'sched.youBring': 'You bring',
    'sched.weBuild': 'We build',
    'sched.calendar': 'Calendar',
    'sched.timesIn': 'Times in',
    'sched.session': 'Session',
    'sched.details': 'Details',
    'sched.name': 'Name',
    'sched.email': 'Email',
    'sched.message': 'What’s on your mind?',
    'sched.send': 'Send request',
    'sched.sending': 'Sending…',
    'sched.consentBefore': 'I accept the ',
    'sched.consentLink': 'Privacy Policy',
    'sched.err.consent': 'Please accept the Privacy Policy.',
    'sched.searchCity': 'Search a city…',
    'sched.searchTimezones': 'Search timezones',
    'sched.timezones': 'Timezones',
    'sched.layout': 'Layout',
    'sched.view.month': 'Month view',
    'sched.view.week': 'Week view',
    'sched.view.list': 'List view',
    'sched.prevMonth': 'Previous month',
    'sched.nextMonth': 'Next month',
    'sched.close': 'Close',
    'sched.loading': 'Loading…',
    'sched.loadError': 'Please try again — time slots require to be loaded.',
    'sched.noTimes': 'No times yet',
    'sched.err.time': 'Please pick a time.',
    'sched.err.name': 'Please add your name.',
    'sched.err.email': 'Please add a valid email.',
    'sched.err.generic': 'Please try again — something is off.',
    // The refusals that come from the server, keyed by the code it sends so they too answer in the
    // visitor's language rather than in the API's.
    'sched.err.slotTaken': 'Please pick another time — that one was just taken.',
    'sched.err.slotUnavailable': 'Please pick another time — that one is no longer available.',
    'sched.err.unavailable': 'Please come back later — booking is not available right now.',
    'sched.done.heading': 'Requested',
    'sched.done.thanks': 'Thank you for asking. It means more than the request suggests.',
    'sched.done.next':
      'I’ll give it proper attention, and you’ll hear back by email either way — that part I promise.',
    'sched.done.join': ' The link to join comes with it.',

    // Home. The section eyebrows reuse the nav's words; the fact labels reuse the footer's.
    'home.eyebrow': 'Independent operator',
    'home.title': 'Strategy / Operations / Production — from scope to ship',
    'home.motto':
      'All products will remain a mirror, a reflection of the values of their creators, and will attract an audience that resonates with these values, whether explicit or implicit.',
    'home.expertise.title': 'What the work involves',
    'home.experience.title': 'Where the work happens',
    'home.recommendations.title': 'What colleagues say',
    'home.proBono.title': 'Let’s talk — book a 30-minute call',
    'home.proBono.sub':
      'Free, and no strings — this is time set aside to help, not a service being sold. All I ask is something real to work on.',
    'fact.languages': 'Languages',
    'fact.offClock': 'Off the clock',
    'home.released': 'Released',

    'privacy.eyebrow': 'Privacy',
    'privacy.title': 'Privacy',
    'privacy.intro': 'I keep only what I need to reply to you, and nothing here tracks you.',
    'privacy.collect': 'What I collect',
    'privacy.collect.body': 'Your name. Your email address. Your notes (if any).',
    'privacy.collect.when': '(when you schedule the 1:1 session)',
    'privacy.why': 'Why',
    'privacy.why.body': 'To arrange, confirm, and prepare for the 1:1 session.',
    'privacy.where': 'Where it goes',
    'privacy.cloudflare': 'hosts this site and stores your request.',
    'privacy.resend': 'delivers the emails.',
    'privacy.cookies': 'Cookies & tracking',
    'privacy.cookies.body': 'No cookies. No analytics. No ads.'
  },

  ru: {
    'nav.expertise': 'Экспертиза',
    'nav.experience': 'Опыт',
    'nav.notes': 'Заметки',
    'nav.contacts': 'Связаться',
    'a11y.language': 'Язык',

    'cta.schedule': 'Записаться на 1:1',
    'cta.resume': 'Скачать резюме',
    'cta.donate': 'Поддержать',

    'footer.navigation': 'Навигация',
    'footer.proBono': 'Pro Bono',
    'footer.location': 'Локация',
    'footer.schedule': '1:1 / Schedule',
    'footer.availability': 'Доступность',
    'footer.resources': 'Материалы',
    'footer.legal': 'Правовая информация',
    'footer.contacts': 'Контакты',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.recommendations': 'Рекомендации',
    'footer.notes': 'Заметки',

    'notes.eyebrow': 'Заметки',
    'notes.title': 'Заметки',
    'notes.description': 'Заметки и старые мысли — такими, какими были написаны.',
    'notes.intro':
      'Старые мысли — такими, какими были написаны. Дата — когда мысль появилась, а не когда её опубликовали.',
    'notes.empty': 'Пока ничего не опубликовано.',
    'notes.back': '← Все заметки',

    'page.home': 'Алексей Козел — Стратегия / Операции / Производство',
    'page.home.description': 'Алексей Козел — Стратегия / Операции / Производство.',
    'page.schedule': 'Алексей Козел — 1:1 / Schedule',
    'page.schedule.description':
      'Бесплатная встреча 1:1 на 30 минут с Алексеем Козелом — стратегия, операции и производство, от замысла до выпуска.',
    'page.recommendations': 'Алексей Козел — Рекомендации',
    'page.recommendations.description': 'Что коллеги и клиенты говорят о работе с Алексеем Козелом.',
    'page.privacy': 'Алексей Козел — Конфиденциальность',
    'page.privacy.description': 'Что этот сайт хранит, а что — нет.',

    'reco.eyebrow': 'Рекомендации',
    'reco.title': 'Их словами',
    'reco.intro':
      'Здесь нет ничего моего. Это их слова, и они убеждают лучше, чем сумел бы я. Спасибо каждому из них.',
    'reco.bullet': 'Рекомендация {n} из {total}, {author}',
    'reco.seeOriginal': 'Показать оригинал · English',
    'reco.seeTranslation': 'Показать перевод · Русский',

    'sched.eyebrow': 'Pro Bono',
    'sched.title': '1:1 / Schedule',
    'sched.intro1': 'Выберите тип встречи, дату, время — и любой контекст, которым хотите поделиться.',
    'sched.intro2': 'Я посмотрю, что у меня со временем, и в любом случае вернусь с ответом.',
    'sched.tag.free': 'Бесплатно',
    'sched.tag.volunteering': 'Волонтёрство',
    'sched.tag.nostrings': 'Без условий',
    'sched.sessions': 'Сессии',
    'sched.sessions.title': 'Что вы приносите, что мы строим',
    'sched.youBring': 'Вы приносите',
    'sched.weBuild': 'Мы строим',
    'sched.calendar': 'Календарь',
    'sched.timesIn': 'Часовой пояс',
    'sched.session': 'Сессия',
    'sched.details': 'Данные',
    'sched.name': 'Имя',
    'sched.email': 'Почта',
    'sched.message': 'Что у вас на уме?',
    'sched.send': 'Отправить заявку',
    'sched.sending': 'Отправляем…',
    'sched.consentBefore': 'Я принимаю ',
    'sched.consentLink': 'Политику конфиденциальности',
    'sched.err.consent': 'Пожалуйста, примите Политику конфиденциальности.',
    'sched.searchCity': 'Поиск города…',
    'sched.searchTimezones': 'Поиск часовых поясов',
    'sched.timezones': 'Часовые пояса',
    'sched.layout': 'Вид',
    'sched.view.month': 'Месяц',
    'sched.view.week': 'Неделя',
    'sched.view.list': 'Список',
    'sched.prevMonth': 'Предыдущий месяц',
    'sched.nextMonth': 'Следующий месяц',
    'sched.close': 'Закрыть',
    'sched.loading': 'Загрузка…',
    'sched.loadError': 'Попробуйте ещё раз — слоты времени должны загрузиться.',
    'sched.noTimes': 'Пока нет свободного времени',
    'sched.err.time': 'Пожалуйста, выберите время.',
    'sched.err.name': 'Пожалуйста, укажите имя.',
    'sched.err.email': 'Пожалуйста, укажите корректную почту.',
    'sched.err.generic': 'Попробуйте ещё раз — что-то не так.',
    'sched.err.slotTaken': 'Пожалуйста, выберите другое время — это только что заняли.',
    'sched.err.slotUnavailable': 'Пожалуйста, выберите другое время — оно больше недоступно.',
    'sched.err.unavailable': 'Пожалуйста, заходите позже — запись сейчас недоступна.',
    'sched.done.heading': 'Заявка отправлена',
    'sched.done.thanks': 'Спасибо, что спрашиваете. Это значит больше, чем кажется по заявке.',
    'sched.done.next':
      'Я уделю этому должное внимание, и вы в любом случае получите ответ по почте — это я обещаю.',
    'sched.done.join': ' Ссылка для подключения придёт вместе с ним.',

    'home.eyebrow': 'Независимый оператор',
    'home.title': 'Стратегия / Операции / Производство — от замысла до выпуска',
    'home.motto':
      'Любой продукт остаётся зеркалом — отражением ценностей своих создателей, и притягивает аудиторию, которой эти ценности откликаются, явно или неявно.',
    'home.expertise.title': 'Из чего состоит работа',
    'home.experience.title': 'Где происходит работа',
    'home.recommendations.title': 'Что говорят коллеги',
    'home.proBono.title': 'Давайте поговорим — запишитесь на 30 минут',
    'home.proBono.sub':
      'Без оплаты и без условий — это время, отведённое, чтобы помочь, а не услуга на продажу. Прошу об одном: чтобы было над чем работать по-настоящему.',
    'fact.languages': 'Языки',
    'fact.offClock': 'Вне работы',
    'home.released': 'Выпущено',

    'privacy.eyebrow': 'Конфиденциальность',
    'privacy.title': 'Конфиденциальность',
    'privacy.intro':
      'Я храню только то, что нужно, чтобы вам ответить, и здесь ничего вас не отслеживает.',
    'privacy.collect': 'Что я собираю',
    'privacy.collect.body': 'Ваше имя. Ваш адрес почты. Ваши заметки (если есть).',
    'privacy.collect.when': '(когда вы записываетесь на встречу 1:1)',
    'privacy.why': 'Зачем',
    'privacy.why.body': 'Чтобы согласовать, подтвердить и подготовиться к встрече.',
    'privacy.where': 'Куда это уходит',
    'privacy.cloudflare': 'хранит этот сайт и ваш запрос.',
    'privacy.resend': 'доставляет письма.',
    'privacy.cookies': 'Cookies и отслеживание',
    'privacy.cookies.body': 'Ни cookies. Ни аналитики. Ни рекламы.'
  },

  be: {
    'nav.expertise': 'Экспертыза',
    'nav.experience': 'Вопыт',
    'nav.notes': 'Нататкі',
    'nav.contacts': 'Сувязь',
    'a11y.language': 'Мова',

    'cta.schedule': 'Запісацца на 1:1',
    'cta.resume': 'Спампаваць рэзюмэ',
    'cta.donate': 'Падтрымаць',

    'footer.navigation': 'Навігацыя',
    'footer.proBono': 'Pro Bono',
    'footer.location': 'Месцазнаходжанне',
    'footer.schedule': '1:1 / Schedule',
    'footer.availability': 'Даступнасць',
    'footer.resources': 'Матэрыялы',
    'footer.legal': 'Прававая інфармацыя',
    'footer.contacts': 'Кантакты',
    'footer.privacy': 'Палітыка прыватнасці',
    'footer.recommendations': 'Рэкамендацыі',
    'footer.notes': 'Нататкі',

    'notes.eyebrow': 'Нататкі',
    'notes.title': 'Нататкі',
    'notes.description': 'Нататкі і старыя думкі — такімі, якімі былі напісаны.',
    'notes.intro':
      'Старыя думкі — такімі, якімі былі напісаны. Дата — калі думка з’явілася, а не калі яе апублікавалі.',
    'notes.empty': 'Пакуль нічога не апублікавана.',
    'notes.back': '← Усе нататкі',

    'page.home': 'Аляксей Козел — Стратэгія / Аперацыі / Вытворчасць',
    'page.home.description': 'Аляксей Козел — Стратэгія / Аперацыі / Вытворчасць.',
    'page.schedule': 'Аляксей Козел — 1:1 / Schedule',
    'page.schedule.description':
      'Бясплатная 30-хвілінная сустрэча 1:1 з Аляксеем Козелам — стратэгія, аперацыі і вытворчасць, ад задумы да выпуску.',
    'page.recommendations': 'Аляксей Козел — Рэкамендацыі',
    'page.recommendations.description': 'Што калегі і кліенты кажуць пра працу з Аляксеем Козелам.',
    'page.privacy': 'Аляксей Козел — Прыватнасць',
    'page.privacy.description': 'Што гэты сайт трымае, а што — не.',

    'reco.eyebrow': 'Рэкамендацыі',
    'reco.title': 'Іх словамі',
    'reco.intro':
      'Тут няма нічога майго. Гэта іх словы, і яны пераконваюць лепш, чым сказаў бы я. Дзякуй кожнаму з іх.',
    'reco.bullet': 'Рэкамендацыя {n} з {total}, {author}',
    'reco.seeOriginal': 'Паказаць арыгінал · English',
    'reco.seeTranslation': 'Паказаць пераклад · Беларуская',

    'sched.eyebrow': 'Pro Bono',
    'sched.title': '1:1 / Schedule',
    'sched.intro1': 'Выберыце тып сустрэчы, дату, час — і любы кантэкст, якім хочаце падзяліцца.',
    'sched.intro2': 'Я пагляджу, што ў мяне па часе, і ў любым выпадку вярнуся з адказам.',
    'sched.tag.free': 'Бясплатна',
    'sched.tag.volunteering': 'Валанцёрства',
    'sched.tag.nostrings': 'Без умоваў',
    'sched.sessions': 'Сесіі',
    'sched.sessions.title': 'Што вы прыносіце, што мы будуем',
    'sched.youBring': 'Вы прыносіце',
    'sched.weBuild': 'Мы будуем',
    'sched.calendar': 'Каляндар',
    'sched.timesIn': 'Часавы пояс',
    'sched.session': 'Сесія',
    'sched.details': 'Даныя',
    'sched.name': 'Імя',
    'sched.email': 'Пошта',
    'sched.message': 'Што ў вас на думцы?',
    'sched.send': 'Адправіць заяўку',
    'sched.sending': 'Адпраўляем…',
    'sched.consentBefore': 'Я прымаю ',
    'sched.consentLink': 'Палітыку прыватнасці',
    'sched.err.consent': 'Калі ласка, прымеце Палітыку прыватнасці.',
    'sched.searchCity': 'Пошук горада…',
    'sched.searchTimezones': 'Пошук часавых паясоў',
    'sched.timezones': 'Часавыя паясы',
    'sched.layout': 'Выгляд',
    'sched.view.month': 'Месяц',
    'sched.view.week': 'Тыдзень',
    'sched.view.list': 'Спіс',
    'sched.prevMonth': 'Папярэдні месяц',
    'sched.nextMonth': 'Наступны месяц',
    'sched.close': 'Закрыць',
    'sched.loading': 'Загрузка…',
    'sched.loadError': 'Паспрабуйце яшчэ раз — слоты часу павінны загрузіцца.',
    'sched.noTimes': 'Пакуль няма вольнага часу',
    'sched.err.time': 'Калі ласка, выберыце час.',
    'sched.err.name': 'Калі ласка, укажыце імя.',
    'sched.err.email': 'Калі ласка, укажыце карэктную пошту.',
    'sched.err.generic': 'Паспрабуйце яшчэ раз — нешта не так.',
    'sched.err.slotTaken': 'Калі ласка, выберыце іншы час — гэты толькі што занялі.',
    'sched.err.slotUnavailable': 'Калі ласка, выберыце іншы час — ён больш недасяжны.',
    'sched.err.unavailable': 'Калі ласка, заходзьце пазней — запіс зараз недаступны.',
    'sched.done.heading': 'Заяўка адпраўлена',
    'sched.done.thanks': 'Дзякуй, што пытаеце. Гэта значыць больш, чым выглядае па заяўцы.',
    'sched.done.next':
      'Я ўдзялю гэтаму належную ўвагу, і вы ў любым выпадку атрымаеце адказ па пошце — гэта я абяцаю.',
    'sched.done.join': ' Спасылка для далучэння прыйдзе разам з ім.',

    'home.eyebrow': 'Незалежны аператар',
    'home.title': 'Стратэгія / Аперацыі / Вытворчасць — ад задумы да выпуску',
    'home.motto':
      'Любы прадукт застаецца люстэркам — адлюстраваннем каштоўнасцей сваіх стваральнікаў, і прыцягвае аўдыторыю, якой гэтыя каштоўнасці адгукаюцца, яўна ці няяўна.',
    'home.expertise.title': 'З чаго складаецца праца',
    'home.experience.title': 'Дзе адбываецца праца',
    'home.recommendations.title': 'Што кажуць калегі',
    'home.proBono.title': 'Давайце пагаворым — запішыцеся на 30 хвілін',
    'home.proBono.sub':
      'Без аплаты і без умоваў — гэта час, адведзены, каб дапамагчы, а не паслуга на продаж. Прашу толькі аднаго: каб было над чым працаваць па-сапраўднаму.',
    'fact.languages': 'Мовы',
    'fact.offClock': 'Па-за працай',
    'home.released': 'Выпушчана',

    'privacy.eyebrow': 'Прыватнасць',
    'privacy.title': 'Прыватнасць',
    'privacy.intro': 'Я захоўваю толькі тое, што патрэбна, каб вам адказаць, і тут нічога вас не адсочвае.',
    'privacy.collect': 'Што я збіраю',
    'privacy.collect.body': 'Ваша імя. Ваш адрас пошты. Вашы нататкі (калі ёсць).',
    'privacy.collect.when': '(калі вы запісваецеся на сустрэчу 1:1)',
    'privacy.why': 'Навошта',
    'privacy.why.body': 'Каб узгадніць, пацвердзіць і падрыхтавацца да сустрэчы.',
    'privacy.where': 'Куды гэта трапляе',
    'privacy.cloudflare': 'трымае гэты сайт і ваш запыт.',
    'privacy.resend': 'дастаўляе лісты.',
    'privacy.cookies': 'Cookies і адсочванне',
    'privacy.cookies.body': 'Ні cookies. Ні аналітыкі. Ні рэкламы.'
  }
};

export function translator(locale) {
  const table = ui[locale] || ui.en;
  return (key) => table[key] ?? ui.en[key] ?? key;
}

// The same lookup, but undefined when a key is genuinely absent — for the places that need to tell
// "not translated yet" from "translated to the key itself", such as a page title falling back.
export function lookup(locale, key) {
  const table = ui[locale] || ui.en;
  return table[key] ?? ui.en[key];
}

// Fills {placeholders} in a translated string, so a sentence with a name or a count in it stays one
// string per language instead of being assembled from fragments in the wrong order.
export function fill(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));
}
