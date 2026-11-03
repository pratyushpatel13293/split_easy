import { api } from './client'

// Each function maps 1:1 to a backend endpoint.

// Users
export const listUsers = () => api.get('/users').then((r) => r.data) // added for the UI
export const createUser = (body) => api.post('/users', body).then((r) => r.data)

// Groups
export const listGroups = () => api.get('/groups').then((r) => r.data) // added for the UI
export const getGroup = (id) => api.get(`/groups/${id}`).then((r) => r.data) // added for the UI
export const createGroup = (body) => api.post('/groups', body).then((r) => r.data)
export const addMember = (groupId, userId) =>
  api.post(`/groups/${groupId}/members`, { userId }).then((r) => r.data)

// Expenses
export const listExpenses = (groupId, page = 0, size = 10) =>
  api.get(`/groups/${groupId}/expenses`, { params: { page, size } }).then((r) => r.data)
export const createExpense = (groupId, body) =>
  api.post(`/groups/${groupId}/expenses`, body).then((r) => r.data)

// Balances & settlements
export const getBalances = (groupId) => api.get(`/groups/${groupId}/balances`).then((r) => r.data)
export const getSettlements = (groupId) => api.get(`/groups/${groupId}/settlements`).then((r) => r.data)

/** Reads every page of a group's expenses (max page size the backend allows is 50). */
export async function listAllExpenses(groupId) {
  const size = 50
  const first = await listExpenses(groupId, 0, size)
  const all = [...first.content]
  for (let p = 1; p < first.page.totalPages; p++) {
    const next = await listExpenses(groupId, p, size)
    all.push(...next.content)
  }
  return all
}
