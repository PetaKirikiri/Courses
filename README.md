# Courses

A React application for managing and displaying language learning courses with interactive translation components.

## Features

- Course listing and management
- Lesson viewing with outcomes
- Interactive translation interface with:
  - Dynamic constituent parsing
  - Multiple dropdown components
  - Flexible sentence structure handling

## Tech Stack

- React
- TypeScript
- Material-UI
- Airtable (for data storage)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/PetaKirikiri/Courses.git
cd Courses
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your Airtable credentials:

```
REACT_APP_AIRTABLE_API_KEY=your_api_key
REACT_APP_AIRTABLE_BASE_ID=your_base_id
```

4. Start the development server:

```bash
npm start
```

## Project Structure

- `/src/components` - React components
  - `/Constituent` - Constituent component for translation
  - `/Course` - Course-related components
  - `/Dropdowns` - Reusable dropdown components
  - `/Lessons` - Lesson-related components
  - `/Translation` - Translation interface components
- `/src/context` - React context providers
- `/src/db` - Database integration (Airtable)
- `/src/pages` - Page components
- `/src/styles` - CSS styles

## License

MIT
