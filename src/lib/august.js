// "The 84th of August" is a joke about today: count the days since the first of August. The count
// rolls over on 1 August, so the line can update itself every day without a deploy. The date may
// be a YYYY-MM-DD string (the site's Minsk day) or a Date (the visitor's day).
export function augustDay(at = new Date()) {
  const [year, month, day] =
    typeof at === 'string'
      ? at.split('-').map(Number)
      : [at.getFullYear(), at.getMonth() + 1, at.getDate()];

  const startYear = month < 8 ? year - 1 : year;
  const start = Date.UTC(startYear, 7, 1);
  const today = Date.UTC(year, month - 1, day);
  return Math.round((today - start) / 86400000) + 1;
}

const ENDINGS = { one: 'st', two: 'nd', few: 'rd', other: 'th' };

// English only: the Russian and Belarusian lines use "-е" for every number.
export function ordinal(n) {
  return ENDINGS[new Intl.PluralRules('en', { type: 'ordinal' }).select(n)] ?? 'th';
}
