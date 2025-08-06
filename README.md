# Fasting App

A comprehensive intermittent fasting tracking application with detailed phase monitoring and progress analytics.

## Features

- ⏱️ **Real-time Timer** - Track your current fasting session with live updates
- 📊 **Fasting Phases** - Detailed information about metabolic changes during fasting
- 📈 **Progress Tracking** - Visual progress bar and statistics
- 📝 **Session History** - Complete history of all fasting sessions
- ⚙️ **Flexible Controls** - Edit start times, stop with confirmation
- 💾 **Data Persistence** - Local storage with export/import capabilities
- 🌓 **Dark Mode Support** - Beautiful UI in both light and dark themes
- 🇷🇴 **Romanian Language** - Localized content and date formatting

## Screenshots
*Add screenshots here when making the repository public*

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/lgloredana/fastingApp.git
cd fastingApp

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
pnpm build
pnpm start
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Storage**: Browser localStorage with JSON export
- **Icons**: Lucide React
- **Date Handling**: date-fns with Romanian locale

## Project Structure
```
fastingApp/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── lib/                 # Utilities and storage logic
├── public/              # Static assets
└── styles/              # Global styles
```

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements.

## Acknowledgments

- Initial UI components generated with [v0.dev](https://v0.dev)
- Extended and customized for comprehensive fasting tracking functionality

## License

MIT License - see LICENSE file for details

## Author

**Loredana Lungu** - [GitHub](https://github.com/lgloredana)