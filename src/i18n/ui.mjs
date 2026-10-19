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
    'nav.contact': 'Contact',
    'a11y.language': 'Language',

    'cta.schedule': 'Schedule 1:1',
    'cta.resume': 'Download Résumé',
    'cta.donate': 'Donate',

    'footer.navigation': 'Navigation',
    'footer.services': 'Services',
    'footer.location': 'Location',
    'footer.availability': 'Availability',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.contact': 'Contact',
    'footer.privacy': 'View Privacy',
    'footer.recommendations': 'Recommendations',
    'footer.resume': 'Résumé',
    'footer.notes': 'Notes',

    'notes.eyebrow': 'Notes',
    'notes.title': 'Notes',
    'notes.description': 'Notes and older thoughts, kept as they were written.',
    'notes.intro':
      'Older thoughts, kept as they were written — dated by when I had them, not by when they went up.',
    'notes.empty': 'Nothing published yet.',
    'notes.back': '← All notes'
  },

  ru: {
    'nav.expertise': 'Экспертиза',
    'nav.experience': 'Опыт',
    'nav.notes': 'Заметки',
    'nav.contact': 'Связаться',
    'a11y.language': 'Язык',

    'cta.schedule': 'Записаться на 1:1',
    'cta.resume': 'Скачать резюме',
    'cta.donate': 'Поддержать',

    'footer.navigation': 'Навигация',
    'footer.services': 'Услуги',
    'footer.location': 'Локация',
    'footer.availability': 'Доступность',
    'footer.resources': 'Материалы',
    'footer.legal': 'Правовая информация',
    'footer.contact': 'Контакты',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.recommendations': 'Рекомендации',
    'footer.resume': 'Резюме',
    'footer.notes': 'Заметки',

    'notes.eyebrow': 'Заметки',
    'notes.title': 'Заметки',
    'notes.description': 'Заметки и старые мысли — такими, какими были написаны.',
    'notes.intro':
      'Старые мысли — такими, какими были написаны. Дата — когда мысль появилась, а не когда её опубликовали.',
    'notes.empty': 'Пока ничего не опубликовано.',
    'notes.back': '← Все заметки'
  },

  be: {
    'nav.expertise': 'Экспертыза',
    'nav.experience': 'Вопыт',
    'nav.notes': 'Нататкі',
    'nav.contact': 'Сувязь',
    'a11y.language': 'Мова',

    'cta.schedule': 'Запісацца на 1:1',
    'cta.resume': 'Спампаваць рэзюмэ',
    'cta.donate': 'Падтрымаць',

    'footer.navigation': 'Навігацыя',
    'footer.services': 'Паслугі',
    'footer.location': 'Месцазнаходжанне',
    'footer.availability': 'Даступнасць',
    'footer.resources': 'Матэрыялы',
    'footer.legal': 'Прававая інфармацыя',
    'footer.contact': 'Кантакты',
    'footer.privacy': 'Палітыка прыватнасці',
    'footer.recommendations': 'Рэкамендацыі',
    'footer.resume': 'Рэзюмэ',
    'footer.notes': 'Нататкі',

    'notes.eyebrow': 'Нататкі',
    'notes.title': 'Нататкі',
    'notes.description': 'Нататкі і старыя думкі — такімі, якімі былі напісаны.',
    'notes.intro':
      'Старыя думкі — такімі, якімі былі напісаны. Дата — калі думка з’явілася, а не калі яе апублікавалі.',
    'notes.empty': 'Пакуль нічога не апублікавана.',
    'notes.back': '← Усе нататкі'
  }
};

export function translator(locale) {
  const table = ui[locale] || ui.en;
  return (key) => table[key] ?? ui.en[key] ?? key;
}
