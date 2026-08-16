// Central helpers for multi-account localStorage support.
//
// Every account gets its own namespace, so each signed-up email keeps its
// own separate clients/proposals/follow-ups/settings/etc. All account
// records live under ACCOUNTS_KEY (an array), and the currently logged-in
// user is tracked separately under SESSION_KEY. Any other piece of data
// that belongs to a specific account should be stored under a key built
// with scopedKey(), so it never leaks between accounts sharing the same
// browser.

const ACCOUNTS_KEY = 'fpt_accounts'
const SESSION_KEY = 'fpt_session'

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

// One-time migration for browsers that used the old single-account scheme
// (a lone 'fpt_user' key, unnamespaced 'clients'/'proposals'/etc data).
// Folds that legacy account into the new fpt_accounts list, under a
// 'legacy' namespace, so existing users don't lose their data.
function migrateLegacyAccount() {
  const legacyUser = localStorage.getItem('fpt_user')
  if (!legacyUser) return
  try {
    const user = JSON.parse(legacyUser)
    if (!user?.email) return
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
    if (accounts.some(a => normalizeEmail(a.email) === normalizeEmail(user.email))) return

    const LEGACY_ID = 'legacy'
    const legacyKeys = [
      'clients', 'proposals', 'followups',
      'fpt_templates', 'fpt_communications', 'fpt_events', 'fpt_activity',
      'fpt_revenue_goal', 'fpt_custom_image', 'fpt_avatar', 'fpt_settings_photo',
      'fpt_bio', 'fpt_timezone', 'fpt_currency', 'fpt_date_format',
      'fpt_time_format', 'fpt_language', 'fpt_tour_done',
      'fpt_theme', 'fpt_accent', 'fpt_compact_mode', 'fpt_animations',
    ]
    legacyKeys.forEach(k => {
      const v = localStorage.getItem(k)
      if (v !== null) localStorage.setItem(`${k}::${LEGACY_ID}`, v)
    })
    accounts.push({ ...user, __legacyId: LEGACY_ID })
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Corrupt legacy data — nothing we can safely migrate.
  }
}

export function getAccounts() {
  migrateLegacyAccount()
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []
  } catch {
    return []
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function findAccount(email) {
  const target = normalizeEmail(email)
  return getAccounts().find(a => normalizeEmail(a.email) === target) || null
}

// Creates or updates an account record. Returns the stored record.
export function upsertAccount(account) {
  const accounts = getAccounts()
  const target = normalizeEmail(account.email)
  const idx = accounts.findIndex(a => normalizeEmail(a.email) === target)
  const record = { ...(idx >= 0 ? accounts[idx] : {}), ...account }
  if (idx >= 0) accounts[idx] = record
  else accounts.push(record)
  saveAccounts(accounts)
  return record
}

export function removeAccount(email) {
  const target = normalizeEmail(email)
  saveAccounts(getAccounts().filter(a => normalizeEmail(a.email) !== target))
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// The namespace suffix for the current account's data. Falls back to a
// shared 'guest' namespace when nobody is logged in (e.g. briefly on the
// landing page) so reads never crash.
export function currentAccountId() {
  const session = getSession()
  if (!session?.email) return 'guest'
  // Migrated legacy accounts keep their original unnamespaced data under
  // the 'legacy' id instead of their email.
  return session.__legacyId || normalizeEmail(session.email)
}

// Builds a per-account storage key, e.g. scopedKey('clients') ->
// 'clients::malik@example.com'. Use this instead of touching localStorage
// directly for anything that should stay separate per account.
export function scopedKey(baseKey, accountId = currentAccountId()) {
  return `${baseKey}::${accountId}`
}

// Removes every localStorage key belonging to a given account namespace.
// Used when deleting an account entirely.
export function clearAccountData(accountId) {
  const suffix = `::${accountId}`
  Object.keys(localStorage)
    .filter(k => k.endsWith(suffix))
    .forEach(k => localStorage.removeItem(k))
}
