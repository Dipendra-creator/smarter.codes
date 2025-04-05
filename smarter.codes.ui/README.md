# Website Content Scraper

A modern, responsive web application built with Next.js that allows users to extract and analyze content from any website. The application features a clean, intuitive interface and provides both card and table views for displaying the extracted content.

## Features

- Clean, modern UI built with Tailwind CSS and shadcn/ui components
- Responsive design that works on all device sizes
- Website content extraction with automatic chunking
- Content filtering based on user queries
- Dual view options: Cards and Table layouts
- Real-time processing with loading states
- Error handling and user feedback

## Tech Stack

- Next.js 13.5
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Cheerio (for HTML parsing)
- Lucide React (for icons)

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the project directory:
```bash
cd website-content-scraper
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Enter a website URL in the first input field
2. (Optional) Enter a search query to filter the content
3. Click "Extract Content" to process the website
4. View the results in either Cards or Table view
5. Switch between views using the tabs at the top of the results section

## API Routes

### POST /api/scrape

Accepts a JSON payload with:
- `url`: The website URL to scrape
- `query`: (Optional) Search query to filter content

Returns:
- Array of content chunks, each containing:
  - `id`: Unique identifier
  - `content`: Text content (limited to 500 tokens)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

