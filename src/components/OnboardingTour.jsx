import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useTheme } from '../context/ThemeContext'

export default function OnboardingTour() {
  const { accent } = useTheme()

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('fpt_tour_done')
    if (hasSeenTour) return

    setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0,0,0,0.5)',
        stagePadding: 8,
        stageRadius: 8,
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: "Let's Go! 🚀",
        steps: [
          {
            element: '#nav-dashboard',
            popover: {
              title: '🏠 Dashboard',
              description: 'Your command center! See all your stats, charts, revenue goal and recent activity at a glance.',
              side: 'right',
            }
          },
          {
            element: '#nav-clients',
            popover: {
              title: '👤 Clients',
              description: 'Add and manage all your freelance clients here. Rate them, add notes and track their proposals.',
              side: 'right',
            }
          },
          {
            element: '#nav-proposals',
            popover: {
              title: '📄 Proposals',
              description: 'Create and track proposals from Draft to Won. Export as PDF, generate follow-up emails and save templates.',
              side: 'right',
            }
          },
          {
            element: '#nav-followups',
            popover: {
              title: '🔔 Follow-ups',
              description: 'Never miss a follow-up! Set reminders and get overdue alerts automatically.',
              side: 'right',
            }
          },
          {
            element: '#nav-kanban',
            popover: {
              title: '🗂️ Kanban Board',
              description: 'Drag and drop proposals across columns to visually track your deal pipeline.',
              side: 'right',
            }
          },
          {
            element: '#nav-settings',
            popover: {
              title: '⚙️ Settings',
              description: 'Customize your currency, date format, accent color, dark mode and more.',
              side: 'right',
            }
          },
          {
            element: '#quick-add-btn',
            popover: {
              title: '⚡ Quick Add',
              description: 'Click this button from anywhere to instantly add a client or proposal without navigating.',
              side: 'top',
            }
          },
        ],
        onDestroyed: () => {
          localStorage.setItem('fpt_tour_done', 'true')
        }
      })

      driverObj.drive()
    }, 2000)
  }, [accent])

  return null
}