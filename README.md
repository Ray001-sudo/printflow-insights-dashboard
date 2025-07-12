# PrintFlow Insights Dashboard

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GPL License](https://img.shields.io/badge/License-GPL-blue.svg)](https://opensource.org/licenses/gpl-license)

## Introduction

The PrintFlow Insights Dashboard is a comprehensive management tool designed to provide insights into print production workflows. It offers features for task management, performance monitoring, and data export, enabling efficient oversight of print operations. This README provides detailed information for developers and end-users to understand, set up, and contribute to the project.

## Project Purpose

> Describe the main objective of the project. What problem does it solve?
> Who is the target audience (e.g., print shop managers, production teams)?

This dashboard centralizes key metrics and management functions, empowering users to optimize their print production processes.

## Goals

> Outline the key goals of the project. For example:
> - Provide real-time insights into production status
> - Enable efficient task assignment and tracking
> - Facilitate data-driven decision-making

The primary goals are to enhance productivity, reduce bottlenecks, and improve overall efficiency in print workflows.

## Key Features

- **Dashboard Overview:** At-a-glance view of key performance indicators (KPIs) such as total jobs, average completion time, and overdue tasks.
- **Task Management:** Tools for creating, assigning, and tracking print tasks.
- **Performance Monitoring:** Charts and reports to visualize task status, top performers, and other relevant metrics.
- **Data Export:** Options to export dashboard data in CSV and PDF formats for reporting and analysis.
- **Role-Based Access Control:** Admin and staff roles with differentiated permissions.
- **Authentication:** Secure user authentication via Supabase.
- **File Management:** Uploading and managing job-related files

## Project Structure

This project relies on the following main technologies:

- [React](https://reactjs.org/): A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript.
- [Vite](https://vitejs.dev/): A fast build tool and development server.
- [shadcn-ui](https://ui.shadcn.com/): A collection of accessible and reusable UI components.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework.
- [Supabase](https://supabase.com/): An open-source Firebase alternative for backend services.
- [@tanstack/react-query](https://tanstack.com/query/latest): Data fetching and caching library

See `package.json` for a complete list of dependencies.

## Local Development Setup

1.  **Clone the repository:**

sh
    git clone <YOUR_GIT_URL>
    cd printflow-insights-dashboard
        - Create a `.env` file in the project root.
    - Add the necessary environment variables, such as Supabase URL and API key:

    sh
    npm run dev
    - **Dependency installation issues:**

    - Ensure you have the latest version of Node.js and npm installed.
    - Try deleting the `node_modules` folder and running `npm install` again.
    - Check for any compatibility issues between dependencies.

- **Supabase connection errors:**

    - Verify that the Supabase URL and API key in your `.env` file are correct.
    - Ensure that your Supabase project is running and accessible.
    - Check your network connection.

- **Port conflicts:**

    - If port `5173` is already in use, Vite will automatically try another port.
    - You can also manually specify a port in the `vite.config.ts` file.

## Project Architecture

The project follows a component-based architecture using React and TypeScript.

- **Components:** The `src/components` directory contains reusable UI components built with `shadcn-ui` and styled with `Tailwind CSS`.
- **Hooks:** The `src/hooks` directory contains custom React hooks for managing authentication, data fetching, and other application logic.
- **Pages:** The `src/pages` directory contains the main application pages, which are routed using `react-router-dom`.
- **Supabase Integration:** The `src/integrations/supabase` directory contains the Supabase client initialization and any other Supabase-related code.

The application uses the Supabase client library to interact with the Supabase backend for authentication, data storage, and real-time updates.

## Coding Standards

- **TypeScript:** All code is written in TypeScript with strict type checking enabled.
- **ESLint:** The project uses ESLint to enforce consistent code style and prevent errors.  Run `npm run lint` to check for linting errors.
- **React:** React components are written as functional components using hooks.
- **Styling:** Tailwind CSS is used for styling components.
- **Commit messages:** Use clear, concise, and descriptive commit messages.

## Testing Procedures

> Describe how to run tests and any testing frameworks used in the project.

Currently, the project does not have a dedicated testing suite. However, it is recommended to implement unit and integration tests using a framework like Jest and React Testing Library.

## Contribution Guidelines

We welcome contributions to the PrintFlow Insights Dashboard project!

1.  **Fork the repository.**
2.  **Create a new branch for your feature or bug fix:**

3.  **Make your changes and commit them with descriptive commit messages.**
4.  **Test your changes thoroughly.**
5.  **Push your branch to your forked repository.**
6.  **Submit a pull request to the main repository.**

> Explain the contribution workflow, including code review process,
> branch naming conventions, and coding style guidelines.

All contributions will be reviewed by the project maintainers.

## License Information

This project is licensed under the MIT and GPL License. See the `LICENSE` file for more information.

> Include details about the project's license and any restrictions or
> permissions associated with it.

## Support and Documentation

For additional information, support, or to report issues, please refer to the following resources:
