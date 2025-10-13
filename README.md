# Tech Trends Explorer

A production-ready React + TypeScript + D3 + Tailwind application that visualizes tech trends through interactive charts.

## Features

- **Stocks Panel**: Multi-line chart with normalize toggle, zoom, and tooltips
- **Job Market Panel**: Bubble chart by city with salary axis and skill filtering
- **Frameworks Panel**: Multi-line popularity timeline
- **Responsive Design**: Charts adapt to different screen sizes
- **Accessibility**: Full ARIA support and keyboard navigation
- **Error Handling**: Graceful error boundaries and loading states
- **Performance Optimized**: Debounced interactions and memoized calculations

## Tech Stack

- **React 18** with TypeScript
- **D3.js** for data visualization
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **ESLint & Prettier** for code quality

## Project Structure

```
src/
├── components/
│   ├── charts/          # Reusable chart components
│   ├── tabs/           # Tab navigation component
│   ├── ErrorBoundary.tsx
│   └── LoadingSpinner.tsx
├── panels/             # Main application panels
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── data/               # Mock data files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Key Improvements Made

### 1. **Type Safety**
- Comprehensive TypeScript interfaces
- Strict type checking enabled
- Proper type annotations throughout

### 2. **Performance Optimizations**
- Debounced mouse interactions (16ms)
- Memoized expensive calculations
- Optimized D3 data transformations
- Custom hooks for reusable logic

### 3. **Error Handling**
- Error boundaries for graceful failures
- Loading states for better UX
- Data validation before rendering

### 4. **Accessibility**
- Full ARIA support
- Keyboard navigation
- Screen reader friendly
- Semantic HTML structure

### 5. **Responsive Design**
- Adaptive chart dimensions
- Mobile-optimized interactions
- Flexible layouts

### 6. **Code Organization**
- Custom hooks for chart logic
- Shared utility functions
- Constants for magic numbers
- Clean separation of concerns

### 7. **Development Experience**
- ESLint configuration
- Prettier formatting
- TypeScript path mapping
- Comprehensive error reporting

## Deployment

The application is containerized with Docker and ready for deployment on Railway, Vercel, or any static hosting platform.

```bash
# Build Docker image
docker build -t tech-trends-explorer .

# Run container
docker run -p 4173:4173 tech-trends-explorer
```

## Micro-frontend Integration

This application can be embedded as an iframe micro-frontend:

```html
<iframe
  src="https://your-app-url.com"
  title="Tech Trends Explorer"
  style="width:100%;border:0;"
  id="tte-frame"
></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'TTE_HEIGHT') {
      document.getElementById('tte-frame').style.height = (e.data.height + 20) + 'px'
    }
  })
</script>
```

## Future Enhancements

- Real-time data integration
- Additional chart types
- Data export functionality
- Theme customization
- Advanced filtering options
- Performance monitoring
