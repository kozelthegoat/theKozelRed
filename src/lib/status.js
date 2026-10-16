import { sendDeclineEmail, dualTime } from './email.js';
import { shouldSendDecline } from './requests.js';

const TYPE_NAMES = { intro: 'Intro Call', career: 'Career Review', work: 'Working Session' };

// Set a request's status and send the decline notice on the transition only — declining an
// already-declined request must not email the requester again.
//
// Shared by the table's form (POST /api/me/status) and the links in the notification email
// (GET /action), so both paths behave identically. Returns the row, or null if it is gone.
export async function applyStatus(db, env, id, status) {
  const { results } = await db
    .prepare(
      'SELECT type, slot_date, slot_time, name, email, status, visitor_tz FROM requests WHERE id = ?'
    )
    .bind(id)
    .all();
  const row = results?.[0];
  if (!row) return null;

  await db.prepare('UPDATE requests SET status = ? WHERE id = ?').bind(status, id).run();

  if (shouldSendDecline(row.status, status)) {
    const when = `${row.slot_date} ${row.slot_time} · ${TYPE_NAMES[row.type] || row.type}`;
    // The subject stays Minsk; the body can also quote the clock they booked in.
    const whenDisplay = dualTime({
      date: row.slot_date,
      time: row.slot_time,
      visitorTz: row.visitor_tz
    });
    await sendDeclineEmail(env, { name: row.name, email: row.email, when, whenDisplay }).catch(
      () => {}
    );
  }

  return { ...row, status };
}
