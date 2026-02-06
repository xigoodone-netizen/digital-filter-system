# Digital Filter System (彩票开奖数据分析和预测系统)

A real-time lottery data analysis and prediction platform built with a modern tech stack.

## 🌟 Features

- **Real-time Data Sync**: Automatically syncs the latest lottery draw data every minute.
- **Nine-Layer Filtering Algorithm**: Advanced filtering logic (L9 to L1) for data analysis.
- **AI Four-Dimensional Scoring**: Evaluates combinations based on Sum, Span, Hot/Cold numbers, and Theoretical hit rate.
- **L6 Hit Rate Statistics**: Tracks and displays historical performance and hit rates.
- **Cyberpunk UI**: Modern, glassmorphism-style dashboard with dark mode support.
- **GitHub Integration**: Capable of pushing results directly to GitHub.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Radix UI, Lucide Icons.
- **Backend**: Node.js, Express, tRPC.
- **Database**: MySQL with Drizzle ORM.
- **Development**: PNPM, TypeScript, Vitest.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PNPM
- MySQL Database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/xigoodone-netizen/digital-filter-system.git
   cd digital-filter-system
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add your database URL:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/db_name
   ```

4. Push database schema:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## 📂 Project Structure

- `client/`: Frontend React application.
- `server/`: Backend Express server and tRPC routers.
- `shared/`: Shared types and constants between client and server.
- `drizzle/`: Database migrations and schema definitions.

## 📄 Documentation

For detailed implementation details, please refer to the [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md).

## ⚖️ License

MIT
