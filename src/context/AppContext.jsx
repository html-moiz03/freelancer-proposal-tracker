import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { logActivity } from '../utils/activityLog'
import { scopedKey } from '../utils/accountStorage'

const AppContext = createContext()

// Top-level helpers keep impure Date access out of component/handler bodies
function timestamp() {
  return Date.now()
}
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem(scopedKey('fpt_currency')) || 'PKR'
  })

  const [clients, setClients] = useState(() => {
    return JSON.parse(localStorage.getItem(scopedKey('clients'))) || []
  })

  const [proposals, setProposals] = useState(() => {
    return JSON.parse(localStorage.getItem(scopedKey('proposals'))) || []
  })

  const [followups, setFollowups] = useState(() => {
    return JSON.parse(localStorage.getItem(scopedKey('followups'))) || []
  })

  useEffect(() => {
    localStorage.setItem(scopedKey('clients'), JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem(scopedKey('proposals'), JSON.stringify(proposals))
  }, [proposals])

  useEffect(() => {
    localStorage.setItem(scopedKey('followups'), JSON.stringify(followups))
  }, [followups])

  useEffect(() => {
    const handleStorage = () => {
      setCurrency(localStorage.getItem(scopedKey('fpt_currency')) || 'PKR')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const autoExpiredRef = useRef(false)

  useEffect(() => {
    if (autoExpiredRef.current) return
    autoExpiredRef.current = true
    const today = todayStr()
    const updated = proposals.map((p) => {
      if (
        (p.status === 'Draft' || p.status === 'Sent' || p.status === 'In Review' || p.status === 'Negotiation') &&
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
    const newClient = { ...client, id: timestamp() }
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
    setProposals([...proposals, { ...proposal, id: timestamp() }])
    logActivity('PROPOSAL_ADDED', `New proposal: ${proposal.title}`)
  }

  const deleteProposal = (id) => {
    const proposal = proposals.find((p) => p.id === id)
    setProposals(proposals.filter((p) => p.id !== id))
    logActivity('PROPOSAL_DELETED', `Deleted proposal: ${proposal?.title}`)
  }

  const updateProposal = (id, updated) => {
    const current = proposals.find(p => p.id === id)
    const patch = { ...updated }
    if (updated.status && current && updated.status !== current.status) {
      patch.statusChangedAt = timestamp()
    }
    setProposals(proposals.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    if (updated.status) {
      logActivity('PROPOSAL_STATUS', `Proposal moved to ${updated.status}: ${proposals.find(p => p.id === id)?.title}`)
    } else {
      logActivity('PROPOSAL_UPDATED', `Updated proposal: ${updated.title || proposals.find(p => p.id === id)?.title}`)
    }
  }

  const addFollowup = (followup) => {
    setFollowups([...followups, { ...followup, id: timestamp() }])
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
    return JSON.parse(localStorage.getItem(scopedKey('fpt_templates'))) || []
  })

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_templates'), JSON.stringify(templates))
  }, [templates])

  const addTemplate = (template) => {
    setTemplates([...templates, { ...template, id: timestamp() }])
    logActivity('TEMPLATE_SAVED', `Saved template: ${template.title}`)
  }

  const deleteTemplate = (id) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const [communications, setCommunications] = useState(() => {
    return JSON.parse(localStorage.getItem(scopedKey('fpt_communications'))) || []
  })

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_communications'), JSON.stringify(communications))
  }, [communications])

  const addCommunication = (comm) => {
    setCommunications([...communications, { ...comm, id: timestamp() }])
    logActivity('COMMUNICATION_LOGGED', `${comm.type} with client logged`)
  }

  const deleteCommunication = (id) => {
    setCommunications(communications.filter((c) => c.id !== id))
  }

  // Custom calendar events (meetings, reviews, reminders, etc.) — separate
  // from proposal deadlines and follow-ups, which are derived elsewhere.
  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem(scopedKey('fpt_events'))) || []
  })

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_events'), JSON.stringify(events))
  }, [events])

  const addEvent = (event) => {
    setEvents([...events, { ...event, id: timestamp() }])
    logActivity('EVENT_ADDED', `New event: ${event.title}`)
  }

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id))
    logActivity('EVENT_DELETED', `Event deleted`)
  }

  return (
    <AppContext.Provider value={{
      clients, addClient, deleteClient, updateClient,
      proposals, addProposal, deleteProposal, updateProposal,
      followups, addFollowup, deleteFollowup, updateFollowup,
      templates, addTemplate, deleteTemplate,
      communications, addCommunication, deleteCommunication,
      events, addEvent, deleteEvent,
      currency, setCurrency,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}