# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew-language financial dashboard built with React and Tailwind CSS. It's a single-file component that manages financial projects with Hebrew text support (RTL layout).

## Key Features

- **Dashboard Tab**: KPI cards showing financial metrics, project status overview, and filtering capabilities
- **Database Tab**: Project management with CRUD operations, search functionality, and inline editing
- **Hebrew Support**: Full RTL (right-to-left) layout and Hebrew text throughout
- **Financial Calculations**: Automatic VAT calculations, payment tracking, and balance management

## Code Architecture

### Core Data Structure
Projects contain:
- Basic info: orderDate, clientName, orderDetails
- Financial data: transactionAmount, vatPercent, totalPayment, projectReceipts, remainingBalance
- Metadata: projectNotes

### Key Components
- **FinancialDashboard**: Main component with tab switching and state management
- **ProjectRow**: Table row component with inline editing capabilities
- **KPICard**: Reusable metric display component

### Financial Logic
- Total payment = transactionAmount × (1 + vatPercent/100)
- Remaining balance = totalPayment - projectReceipts
- Completion rate = (totalReceipts / totalPayment) × 100

## Development Notes

### State Management
- Uses React hooks (useState, useMemo) for local state
- Projects array holds all financial data
- Filtering and search implemented client-side

### UI Framework
- Tailwind CSS for styling
- Lucide React for icons
- Hebrew currency formatting with Intl.NumberFormat

### No Build System
This appears to be a standalone component without a build configuration. When integrating:
- Ensure React, Tailwind CSS, and Lucide React dependencies are available
- Component exports as default and can be imported directly
- No external API calls - all data is managed in local state