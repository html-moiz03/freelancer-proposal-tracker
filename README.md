# 🗂️ Freelancer Proposal Tracker

A professional CRM web application built for freelancers to manage clients, track proposals, monitor deal statuses, and never miss a follow-up — all in one place.

🌐 **Live Demo:** [freelancer-proposal-tracker.netlify.app](https://freelancer-proposal-tracker.netlify.app)

---

## 📸 Screenshots

> Dashboard · Proposals · Kanban Board · Landing Page

---

## ✨ Features

### 🏠 Landing Page & Authentication
- Professional landing page with animated hero, doodle background, and SVG avatar
- Animated arched stat cards with counting animation
- Signup & Login with form validation
- Session management via localStorage

### 📊 Dashboard
- 6 real-time stat cards (Clients, Proposals, Won, Win Rate, Revenue, Overdue)
- Monthly revenue goal tracker with animated progress bar
- Bar chart — proposals by month (Recharts)
- Donut pie chart — status breakdown (Recharts)
- Recent proposals and upcoming follow-ups feed

### 👤 Clients
- Add, edit, delete clients with form validation
- Duplicate email prevention
- Real-time search and filter
- Client detail page with per-client stats and proposal history
- CSV export

### 📄 Proposals
- Full CRUD with status tracking (Draft → Sent → In Review → Won/Lost)
- Status filter pills
- Proposal expiry warning badges (yellow = expiring soon, red = deadline passed)
- PDF export with branded layout (jsPDF)
- CSV export

### 🔔 Follow-ups
- Link follow-ups to proposals with date and notes
- Overdue detection with red highlight
- Upcoming reminder badge based on reminder days setting
- Edit and delete support

### 🗂️ Kanban Board
- Drag and drop proposals across 5 status columns
- Real-time status update on drop
- Color coded column headers

### ⚙️ Settings
- Currency selector (PKR, USD, EUR, GBP, AED)
- Date format (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)
- Follow-up reminder days
- Dark mode toggle
- Accent color picker (6 colors)
- Export all data as JSON backup
- Import data from JSON
- Change password
- Reset all data

### 🌙 Dark Mode
- Full dark mode across all pages
- Persists across sessions via localStorage

### 📱 Mobile Responsive
- Hamburger menu sidebar on mobile
- Slide-in sidebar with overlay close

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router DOM | Client-side routing |
| Context API | Global state management |
| localStorage | Data persistence |
| Recharts | Analytics charts |
| jsPDF | PDF export |
| @hello-pangea/dnd | Drag and drop Kanban |
| Netlify | Deployment |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── FancyButton.jsx
│   ├── Toast.jsx
│   └── EmptyState.jsx
├── context/
│   ├── AppContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── ClientDetail.jsx
│   ├── Proposals.jsx
│   ├── Followups.jsx
│   ├── Kanban.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── utils/
│   ├── exportPDF.js
│   ├── exportCSV.js
│   └── formatDate.js
├── App.jsx
└── main.jsx
public/
└── _redirects
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/html-moiz03/freelancer-proposal-tracker.git

# Navigate to project
cd freelancer-proposal-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 👤 Author

**Malik Abdul Moiz Awan**
- GitHub: [@html-moiz03](https://github.com/html-moiz03)
- LinkedIn: [malik-abdulmoiz](www.linkedin.com/in/malik-abdul-moiz-zaheer-awan-6a9997259)

---

## 🏢 Built During

**Zynvex Solutions — Frontend Development Internship 2026**
Intern ID: ZYNVEX-CERT-0449

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).