// The chrome, in every language the site speaks. Only the shared furniture lives here — nav,
// footer, buttons, and the notes surfaces — because that is what changes when someone switches
// language. Page bodies are still English, which is the known gap in this pass.
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

    // Page copy. Each page's strings live under its own section, so a page can be translated whole
    // rather than half — which is what happened when only the layout's chrome was in here.
    'page.privacy': 'Aliaksei Kozel — Privacy',
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

    'page.privacy': 'Aliaksei Kozel — Конфиденциальность',
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

    'page.privacy': 'Aliaksei Kozel — Прыватнасць',
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
