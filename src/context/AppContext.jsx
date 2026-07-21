import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [clients, setClients] = useState(() => {
    return JSON.parse(localStorage.getItem('clients')) || []
  })

  const [proposals, setProposals] = useState(() => {
    return JSON.parse(localStorage.getItem('proposals')) || []
  })

  const [followups, setFollowups] = useState(() => {
    return JSON.parse(localStorage.getItem('followups')) || []
  })

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('proposals', JSON.stringify(proposals))
  }, [proposals])

  useEffect(() => {
    localStorage.setItem('followups', JSON.stringify(followups))
  }, [followups])

  // Client actions
  const addClient = (client) => {
    setClients([...clients, { ...client, id: Date.now() }])
  }

  const deleteClient = (id) => {
    setClients(clients.filter((c) => c.id !== id))
  }

  const updateClient = (id, updated) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, ...updated } : c)))
  }

  // Proposal actions
  const addProposal = (proposal) => {
    setProposals([...proposals, { ...proposal, id: Date.now() }])
  }

  const deleteProposal = (id) => {
    setProposals(proposals.filter((p) => p.id !== id))
  }

  const updateProposal = (id, updated) => {
    setProposals(proposals.map((p) => (p.id === id ? { ...p, ...updated } : p)))
  }

  // Followup actions
  const addFollowup = (followup) => {
    setFollowups([...followups, { ...followup, id: Date.now() }])
  }

  const deleteFollowup = (id) => {
    setFollowups(followups.filter((f) => f.id !== id))
  }

  return (
    <AppContext.Provider value={{
      clients, addClient, deleteClient, updateClient,
      proposals, addProposal, deleteProposal, updateProposal,
      followups, addFollowup, deleteFollowup,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}