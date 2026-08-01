import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const COLUMNS = ['Draft', 'Sent', 'In Review', 'Won', 'Lost']

const COLUMN_COLORS = {
  Draft: { header: '#6B6B6B', light: '#F1F0EE', dark: '#1a1a1a' },
  Sent: { header: '#1D4ED8', light: '#DBEAFE', dark: '#1a1a2e' },
  'In Review': { header: '#D97706', light: '#FEF3C7', dark: '#1a1500' },
  Won: { header: '#065F46', light: '#D1FAE5', dark: '#001a0a' },
  Lost: { header: '#991B1B', light: '#FEE2E2', dark: '#1a0000' },
}

export default function Kanban() {
  const { proposals, updateProposal, clients } = useApp()
  const { isDark } = useTheme()

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const cardBg = isDark ? '#1a1a1a' : '#FFFFFF'
  const cardBorder = isDark ? '#2a2a2a' : '#E9E9E7'

  const getClientName = (id) => {
    const client = clients.find((c) => c.id === Number(id))
    return client ? client.name : 'Unknown'
  }

  const getColumnProposals = (status) =>
    proposals.filter((p) => p.status === status)

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const proposalId = Number(draggableId)
    updateProposal(proposalId, { status: destination.droppableId })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>Kanban Board</h2>
        <span className="text-sm" style={{ color: subColor }}>Drag proposals to update their status</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          minHeight: '70vh',
        }}>
          {COLUMNS.map((column) => {
            const colProposals = getColumnProposals(column)
            const colColors = COLUMN_COLORS[column]

            return (
              <div
                key={column}
                style={{
                  minWidth: '220px',
                  width: '220px',
                  flexShrink: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${cardBorder}`,
                }}
              >
                {/* Column Header */}
                <div style={{
                  backgroundColor: colColors.header,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '13px' }}>
                    {column}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}>
                    {colProposals.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        backgroundColor: snapshot.isDraggingOver
                          ? (isDark ? '#1e1e1e' : colColors.light)
                          : (isDark ? '#141414' : '#F9F9F8'),
                        minHeight: '200px',
                        padding: '10px',
                        transition: 'background-color 0.2s ease',
                        height: '100%',
                      }}
                    >
                      {colProposals.map((proposal, index) => (
                        <Draggable
                          key={proposal.id}
                          draggableId={String(proposal.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                backgroundColor: snapshot.isDragging
                                  ? (isDark ? '#2a2a2a' : '#FFFFFF')
                                  : cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderRadius: '10px',
                                padding: '12px',
                                marginBottom: '10px',
                                boxShadow: snapshot.isDragging
                                  ? '0 8px 24px rgba(0,0,0,0.15)'
                                  : '0 1px 4px rgba(0,0,0,0.06)',
                                cursor: 'grab',
                                transition: 'box-shadow 0.2s',
                                ...provided.draggableProps.style,
                              }}
                            >
                              {/* Proposal Title */}
                              <p style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: titleColor,
                                marginBottom: '6px',
                                lineHeight: '1.3',
                              }}>
                                {proposal.title}
                              </p>

                              {/* Client */}
                              <p style={{
                                fontSize: '11px',
                                color: subColor,
                                marginBottom: '4px',
                              }}>
                                👤 {getClientName(proposal.clientId)}
                              </p>

                              {/* Amount */}
                              <p style={{
                                fontSize: '11px',
                                color: subColor,
                                marginBottom: '4px',
                              }}>
                                💰 PKR {Number(proposal.amount).toLocaleString()}
                              </p>

                              {/* Deadline */}
                              <p style={{
                                fontSize: '11px',
                                color: subColor,
                              }}>
                                📅 {proposal.deadline}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty column message */}
                      {colProposals.length === 0 && !snapshot.isDraggingOver && (
                        <div style={{
                          textAlign: 'center',
                          padding: '30px 10px',
                          color: subColor,
                          fontSize: '12px',
                        }}>
                          No proposals
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}