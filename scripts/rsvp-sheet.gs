/**
 * rsvp-sheet.gs
 * ------------------------------------------------------------------
 * Receives RSVPs from BOTH Agra invitations and appends them to the
 * spreadsheet this script is bound to:
 *
 *   - the marriage invitation (20 & 21 Nov) → Event = "Marriage"
 *   - the 21st-only invitation               → Event = "21st Only"
 *
 * Each site sends its own `event` value. A reply without one is from
 * the marriage site (older builds never sent anything else), so it is
 * labelled "Marriage".
 *
 * A "Summary" tab counts replies and headcount per site, and people
 * expected on each day. It is built from formulas, so it updates by
 * itself as replies arrive.
 *
 * This file is not part of the website. It is pasted into Google Apps
 * Script. After pasting, run `setup` once from the editor (it labels
 * any unlabelled rows and rebuilds the Summary tab), then update the
 * EXISTING deployment — Deploy → Manage deployments → Edit → Version:
 * New version → Deploy — so the web app URL stays the same.
 * ------------------------------------------------------------------
 */

var HEADERS = [
  'Submitted',
  'Name',
  'Attending',
  'Guests',
  'Phone',
  'Message',
  'Event',
];

var EVENT_COL = 7; // column G
var MARRIAGE_EVENT = 'Marriage';
var DAY21_EVENT = '21st Only';
var SUMMARY_NAME = 'Summary';

/** The tab replies go to: the first one that is not the Summary. */
function responsesSheet_() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== SUMMARY_NAME) return sheets[i];
  }
  return SpreadsheetApp.getActiveSpreadsheet().insertSheet('Replies', 0);
}

/** Writes the header row, or adds "Event" to an existing one. */
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else if (sheet.getRange(1, EVENT_COL).getValue() !== 'Event') {
    sheet.getRange(1, EVENT_COL).setValue('Event');
  }
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#f0e4ca');
  sheet.setFrozenRows(1);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var sheet = responsesSheet_();
    ensureHeaders_(sheet);

    var d = JSON.parse(e.postData.contents);
    var event = d.event === DAY21_EVENT ? DAY21_EVENT : MARRIAGE_EVENT;

    sheet.appendRow([
      // A real Date, not the ISO string, so the column sorts and filters.
      d.submittedAt ? new Date(d.submittedAt) : new Date(),
      d.name || '',
      d.attendance === 'yes' ? 'Yes' : 'No',
      d.guests || '',
      // Leading apostrophe keeps +91… a phone number rather than a sum.
      d.phone ? "'" + d.phone : '',
      d.message || '',
      event,
    ]);

    sheet.autoResizeColumns(1, HEADERS.length);

    return json({ ok: true });
  } catch (err) {
    // Logged for you; the guest only ever sees the invitation's own message.
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you open the web app URL in a browser to check it is alive. */
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is running.' });
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* One-time setup — run from the editor (select `setup`, press Run).   */
/* Safe to run again: it never touches a row that already has an Event */
/* and rebuilds the Summary tab from scratch.                           */
/* ------------------------------------------------------------------ */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = responsesSheet_();
  ensureHeaders_(sheet);

  // Any unlabelled reply came from the marriage site — the 21st-only
  // site always sends its own label.
  var last = sheet.getLastRow();
  if (last > 1) {
    var range = sheet.getRange(2, EVENT_COL, last - 1, 1);
    var values = range.getValues();
    var names = sheet.getRange(2, 2, last - 1, 1).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] === '' && names[i][0] !== '') values[i][0] = MARRIAGE_EVENT;
    }
    range.setValues(values);
  }
  sheet.autoResizeColumns(1, HEADERS.length);

  buildSummary_(ss, sheet.getName());
}

function buildSummary_(ss, responsesName) {
  var summary = ss.getSheetByName(SUMMARY_NAME);
  if (summary) summary.clear();
  else summary = ss.insertSheet(SUMMARY_NAME, ss.getSheets().length);

  var r = "'" + responsesName.replace(/'/g, "''") + "'!";
  var A = r + '$C:$C'; // Attending
  var G = r + '$D:$D'; // Guests
  var E = r + '$G:$G'; // Event

  function row(label, eventCriteria) {
    // eventCriteria is a quoted value, or null for "both events".
    var ev = eventCriteria ? ',' + E + ',' + eventCriteria : ',' + E + ',"<>"';
    return [
      label,
      // "Both" also matches the header row, so take that one back off.
      '=COUNTIFS(' + r + '$B:$B,"<>"' + ev + ')' + (eventCriteria ? '' : '-1'),
      '=COUNTIFS(' + A + ',"Yes"' + ev + ')',
      '=COUNTIFS(' + A + ',"No"' + ev + ')',
      '=SUMIFS(' + G + ',' + A + ',"Yes"' + ev + ')',
    ];
  }

  var q = function (s) { return '"' + s + '"'; };

  var rows = [
    ['RSVP summary — updates automatically', '', '', '', ''],
    ['', '', '', '', ''],
    ['Replies from', 'Total replies', 'Attending', 'Not attending', 'People coming'],
    row('Marriage site (20 & 21 Nov)', q(MARRIAGE_EVENT)),
    row('21st-only site', q(DAY21_EVENT)),
    row('Both sites (total)', null),
    ['', '', '', '', ''],
    ['Headcount by day', '', '', '', 'People coming'],
    ['20 Nov — Lagun, Ring Ceremony, Sangeet', '', '', '', '=E4'],
    ['21 Nov — Haldi, Barat, Jaimaal', '', '', '', '=E6'],
  ];

  summary.getRange(1, 1, rows.length, 5).setValues(rows);

  summary.getRange('A1').setFontWeight('bold').setFontSize(13);
  summary.getRange('A3:E3').setFontWeight('bold').setBackground('#f0e4ca');
  summary.getRange('A8:E8').setFontWeight('bold').setBackground('#f0e4ca');
  summary.getRange('A6:E6').setFontWeight('bold');
  summary.getRange('A9:A10').setFontWeight('bold');
  summary.setColumnWidth(1, 230);
  summary.setColumnWidths(2, 4, 120);
  summary.getRange('B3:E10').setHorizontalAlignment('center');
  summary.getRange('A12').setValue(
    'People coming = sum of the Guests column for replies marked Yes. ' +
    'Marriage-site guests are invited on both days, so the 21 Nov ' +
    'headcount includes them as well as the 21st-only guests.'
  ).setFontStyle('italic').setFontColor('#777777');
}
