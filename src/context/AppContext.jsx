import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { logActivity } from '../utils/activityLog'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('fpt_currency') || 'PKR'
  })

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

  useEffect(() => {
    const handleStorage = () => {
      setCurrency(localStorage.getItem('fpt_currency') || 'PKR')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const autoExpiredRef = useRef(false)

  useEffect(() => {
    if (autoExpiredRef.current) return
    autoExpiredRef.current = true
    const today = new Date().toISOString().split('T')[0]
    const updated = proposals.map((p) => {
      if (
        (p.status === 'Draft' || p.status === 'Sent' || p.status === 'In Review') &&
        p.deadline && p.deadline < today
      ) {
        logActivity('PROPOSAL_AUTO_EXPIRED', `Auto-expired: ${p.title}`)
        return { ...p, status: 'Lost' }
      }
      return p
    })
    const hasChanges = updated.some((p, i) => p.status !== proposals[i].status)
    if (hasChanges) {
      setTimeout(() => setProposals(updated), 0)
    }
  }, [proposals])

  // Client actions
  const addClient = (client) => {
    const newClient = { ...client, id: Date.now() }
    setClients([...clients, newClient])
    logActivity('CLIENT_ADDED', `Added client: ${client.name}`)
  }

  const deleteClient = (id) => {
    const client = clients.find((c) => c.id === id)
    setClients(clients.filter((c) => c.id !== id))
    logActivity('CLIENT_DELETED', `Deleted client: ${client?.name}`)
  }

  const updateClient = (id, updated) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, ...updated } : c)))
    logActivity('CLIENT_UPDATED', `Updated client: ${updated.name || 'Unknown'}`)
  }

  const addProposal = (proposal) => {
    setProposals([...proposals, { ...proposal, id: Date.now() }])
    logActivity('PROPOSAL_ADDED', `New proposal: ${proposal.title}`)
  }

  const deleteProposal = (id) => {
    const proposal = proposals.find((p) => p.id === id)
    setProposals(proposals.filter((p) => p.id !== id))
    logActivity('PROPOSAL_DELETED', `Deleted proposal: ${proposal?.title}`)
  }

  const updateProposal = (id, updated) => {
    setProposals(proposals.map((p) => (p.id === id ? { ...p, ...updated } : p)))
    if (updated.status) {
      logActivity('PROPOSAL_STATUS', `Proposal moved to ${updated.status}: ${proposals.find(p => p.id === id)?.title}`)
    } else {
      logActivity('PROPOSAL_UPDATED', `Updated proposal: ${updated.title || proposals.find(p => p.id === id)?.title}`)
    }
  }

  const addFollowup = (followup) => {
    setFollowups([...followups, { ...followup, id: Date.now() }])
    logActivity('FOLLOWUP_ADDED', `Follow-up added for proposal ID: ${followup.proposalId}`)
  }

  const deleteFollowup = (id) => {
    setFollowups(followups.filter((f) => f.id !== id))
    logActivity('FOLLOWUP_DELETED', `Follow-up deleted`)
  }

  const updateFollowup = (id, updated) => {
    setFollowups(followups.map((f) => (f.id === id ? { ...f, ...updated } : f)))
    logActivity('FOLLOWUP_UPDATED', `Follow-up updated`)
  }

  const [templates, setTemplates] = useState(() => {
    return JSON.parse(localStorage.getItem('fpt_templates')) || []
  })

  useEffect(() => {
    localStorage.setItem('fpt_templates', JSON.stringify(templates))
  }, [templates])

  const addTemplate = (template) => {
    setTemplates([...templates, { ...template, id: Date.now() }])
    logActivity('TEMPLATE_SAVED', `Saved template: ${template.title}`)
  }

  const deleteTemplate = (id) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const [communications, setCommunications] = useState(() => {
    return JSON.parse(localStorage.getItem('fpt_communications')) || []
  })

  useEffect(() => {
    localStorage.setItem('fpt_communications', JSON.stringify(communications))
  }, [communications])

  const addCommunication = (comm) => {
    setCommunications([...communications, { ...comm, id: Date.now() }])
    logActivity('COMMUNICATION_LOGGED', `${comm.type} with client logged`)
  }

  const deleteCommunication = (id) => {
    setCommunications(communications.filter((c) => c.id !== id))
  }
  return (
    <AppContext.Provider value={{
      clients, addClient, deleteClient, updateClient,
      proposals, addProposal, deleteProposal, updateProposal,
      followups, addFollowup, deleteFollowup, updateFollowup,
      templates, addTemplate, deleteTemplate,
      communications, addCommunication, deleteCommunication,
      currency, setCurrency,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}