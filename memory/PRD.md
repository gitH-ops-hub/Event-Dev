# Event Manager Application PRD

## Original Problem Statement
Build an Eventbrite-like event management application with:
- Registration page for uploaded events
- QR codes and barcodes generation for tickets (both in same PDF)
- Admin JWT authentication
- Venue check-in with handheld barcode scanners + mobile scanning
- Walk-in registration for guests
- Configurable branding
- Email tickets + download as PDF

## User Personas
1. **Event Organizer (Admin)**: Creates events, manages registrations, configures branding
2. **Attendee**: Registers for events, receives tickets, presents at venue
3. **Venue Staff**: Scans barcodes/QR codes to verify registrations

## Core Requirements (Static)
- JWT-based admin authentication
- Event CRUD with custom fields
- Registration with validation
- Dual QR + Barcode ticket generation
- PDF ticket download
- Email ticket delivery (requires Resend API key)
- Scanner interface for venue check-in
- Walk-in registration for guests

## What's Been Implemented (April 6, 2026)

### Backend (FastAPI + MongoDB)
- [x] JWT authentication with admin seeding
- [x] Event CRUD with custom fields support
- [x] Registration API with duplicate checking
- [x] QR code generation (qrcode library)
- [x] Barcode generation (python-barcode, Code128)
- [x] PDF ticket generation (reportlab)
- [x] Email sending (Resend integration - requires API key)
- [x] Verification/scanner API
- [x] Walk-in registration with auto check-in
- [x] Branding configuration API
- [x] Statistics dashboard API

### Frontend (React + Tailwind + Shadcn UI)
- [x] Admin login page
- [x] Dashboard with stats
- [x] Events management (list, create, edit, delete)
- [x] Custom fields builder for events
- [x] Registrations list with filters
- [x] Scanner page (keyboard/scanner input)
- [x] Walk-in registration page
- [x] Branding configuration page
- [x] Public events listing
- [x] Public registration form
- [x] Ticket page with QR + Barcode display
- [x] PDF download functionality
- [x] Share functionality

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Admin authentication
- [x] Event creation
- [x] Registration flow
- [x] Ticket generation

### P1 (Important) - DONE
- [x] Scanner interface
- [x] Walk-in registration
- [x] PDF download
- [x] Session persistence fix

### P2 (Nice to Have)
- [ ] Camera-based QR scanning (requires HTTPS)
- [ ] Bulk email sending
- [ ] Export registrations to CSV
- [ ] Multiple admin users

## Next Action Items
1. Configure Resend API key for email functionality
2. Test with handheld barcode scanner device
3. Add more custom field types (file upload, checkbox)
4. Implement camera QR scanning (requires SSL)
5. Add registration export functionality

## Technical Stack
- Backend: FastAPI, MongoDB, PyJWT, bcrypt, qrcode, python-barcode, reportlab
- Frontend: React 19, Tailwind CSS, Shadcn UI, qrcode.react, react-barcode
- Authentication: JWT with localStorage + cookies
