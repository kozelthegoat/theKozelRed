// The words the requester reads, per language.
//
// Email copy lives apart from the site's dictionary on purpose: it is written to be read in an
// inbox rather than on a page, and one email here is never the visitor's — the host notification
// stays English, because it is his working copy of the request and a Russian version of it in his
// own inbox buys nothing.
//
// The names and numbers carried inside a sentence — the session's "RE: Career", the date, the time,
// the offset — read the same in every language. Only the words around them change.
const mail = {
  en: {
    greet: 'Hi {name},',
    thanks: 'Thank you for your request.',
    willSee: 'I’ll see what’s on my plate, and come back to you either way.',
    confirm: 'I confirm your 1:1.',
    attached: 'I’ve attached a calendar file so it’s in your diary.',
    join: 'Join: {url}',
    joinLabel: 'Join the call',
    grateful: 'Thank you for reaching out — I’m grateful for the opportunity.',
    declined: 'An update on your request: I’m not able to take the time you picked.',
    stillWelcome:
      'If you’d still like to talk, you’re welcome to choose another time whenever it suits you.',
    sendLabel: 'Send request',
    minutes: '({n} min)',
    signoff: 'I appreciate your trust.'
  },

  ru: {
    greet: 'Здравствуйте, {name},',
    thanks: 'Спасибо за вашу заявку.',
    willSee: 'Я посмотрю, что у меня со временем, и в любом случае вернусь с ответом.',
    confirm: 'Подтверждаю вашу встречу 1:1.',
    attached: 'Я приложил файл календаря, чтобы встреча оказалась в вашем расписании.',
    join: 'Подключиться: {url}',
    joinLabel: 'Подключиться',
    grateful: 'Спасибо, что написали — я благодарен за эту возможность.',
    declined: 'Обновление по вашей заявке: не смогу взять выбранное вами время.',
    stillWelcome:
      'Если всё ещё хотите поговорить, вы можете выбрать другое время, когда вам удобно.',
    sendLabel: 'Отправить заявку',
    minutes: '({n} мин)',
    signoff: 'Ценю ваше доверие.'
  },

  be: {
    greet: 'Вітаю, {name},',
    thanks: 'Дзякуй за вашу заяўку.',
    willSee: 'Я пагляджу, што ў мяне па часе, і ў любым выпадку вярнуся з адказам.',
    confirm: 'Пацвярджаю вашу сустрэчу 1:1.',
    attached: 'Я далучыў файл календара, каб сустрэча апынулася ў вашым раскладзе.',
    join: 'Далучыцца: {url}',
    joinLabel: 'Далучыцца',
    grateful: 'Дзякуй, што напісалі — я ўдзячны за гэтую магчымасць.',
    declined: 'Абнаўленне па вашай заяўцы: не змагу ўзяць абраны вамі час.',
    stillWelcome:
      'Калі ўсё яшчэ хочаце пагаварыць, вы можаце выбраць іншы час, калі вам зручна.',
    sendLabel: 'Адправіць заяўку',
    minutes: '({n} хв)',
    signoff: 'Цаню ваша давер.'
  }
};

export const mailFor = (locale) => mail[locale] ?? mail.en;
export const mailLocales = Object.keys(mail);
