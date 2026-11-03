// Creates clean demo data through the REAL SplitEasy API (no database access, no fake data).
// Usage (with Spring Boot running):   npm run seed
// Optional: API_URL=http://localhost:8080 npm run seed
//
// Run it on an EMPTY database. If the demo emails already exist the backend returns 409
// and the script stops without creating duplicates.

const API = (process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '')

async function call(method, path, body) {
  let res
  try {
    res = await fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(`Can't reach ${API}. Start the Spring Boot app first.`)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${data?.message ?? res.statusText}`)
  return data
}

const user = (name, email) => call('POST', '/users', { name, email })
const group = (name) => call('POST', '/groups', { name })
const member = (g, u) => call('POST', `/groups/${g.id}/members`, { userId: u.id })
const expense = (g, payer, description, amount) =>
  call('POST', `/groups/${g.id}/expenses`, { description, amount, paidByUserId: payer.id })

try {
  const amit = await user('Amit', 'amit@spliteasy.demo')
  const bina = await user('Bina', 'bina@spliteasy.demo')
  const chetan = await user('Chetan', 'chetan@spliteasy.demo')
  const rahul = await user('Rahul', 'rahul@spliteasy.demo')
  const mohan = await user('Mohan', 'mohan@spliteasy.demo')

  // Goa Trip: same numbers as SettlementServiceTest.goaTrip_producesTwoPayments
  const goa = await group('Goa Trip')
  for (const u of [amit, bina, chetan]) await member(goa, u)
  await expense(goa, amit, 'Hotel', 300)   // 100 each -> Amit +200, Bina -100, Chetan -100
  await expense(goa, bina, 'Lunch', 90)    // 30 each  -> Amit +170, Bina -40,  Chetan -130

  // Office Lunch: shows the rounding rule (100 / 3 = 33.33, payer gets 33.34)
  const office = await group('Office Lunch')
  for (const u of [amit, rahul, mohan]) await member(office, u)
  await expense(office, rahul, 'Team dinner', 100)

  const balances = await call('GET', `/groups/${goa.id}/balances`)
  const settlements = await call('GET', `/groups/${goa.id}/settlements`)
  const names = Object.fromEntries([amit, bina, chetan].map((u) => [u.id, u.name]))

  console.log('Demo data created.\n\nGoa Trip balances:')
  for (const b of balances) console.log(`  ${b.userName.padEnd(7)} ${b.balance}`)
  console.log('Goa Trip settlements:')
  for (const s of settlements) console.log(`  ${names[s.fromUserId]} pays ${names[s.toUserId]} ${s.amount}`)
} catch (err) {
  console.error('Seeding stopped: ' + err.message)
  if (String(err.message).includes('409')) {
    console.error('The demo data already exists. Reset the database first (see README, "Reset the database").')
  }
  process.exit(1)
}
