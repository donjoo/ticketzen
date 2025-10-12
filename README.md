# 🎫 Ticket Management System

A robust, real-time platform for support ticket management—built with Django REST Framework, Django Channels, and React, featuring true role-based access and live updates.

---

## Features

- **Raise & Track Tickets:** Users create, view, update, and delete support tickets.  
- **Admin Controls:** Administrators can manage all tickets: assign, resolve, and delete.  
- **Real-Time Updates:** Ticket changes are instantly visible via WebSockets—no refresh required.  
- **Role-Based Access:** Standard users access their own tickets; admins have full visibility and control.  
- **Authentication:** Secure login and access implemented with Django’s built-in user system.  
- **Filtering:** Dashboard allows sorting by status, priority, and user.  
- **Modern, Responsive UI:** Built with Material UI (or Tailwind CSS) for a professional look.  
- **Validation & Error Handling:** Robust form validation and user-friendly API error responses.

---

## Tech Stack

- **Backend:** Python, Django, Django REST Framework, Django Channels, Daphne (ASGI)
- **Frontend:** React, JavaScript, Material UI or Tailwind CSS
- **Database:** SQLite (development; ready for PostgreSQL in production)
- **Authentication:** Django user authentication

---

## Project Structure

ticketzen/
├── ticket-manager-frontend/
│ └── src/pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── TicketDetail.jsx
│   └── Admin.jsx
│   └── ...
└── ticket_system/
    ├── ticket_system/settings.py
    ├── asgi.py
    └── ...


---

## Getting Started

### Backend (Django/DRF)

1. **Install dependencies:**  
   `pip install -r requirements.txt`
2. **Apply migrations:**  
   `python manage.py migrate`
3. **Create superuser (admin):**  
   `python manage.py createsuperuser`
4. **Start ASGI server (WebSockets):**  
   `daphne ticket_system.asgi:application`

### Frontend (React)

1. **Install dependencies:**  
   `cd ticket-manager-frontend && npm install`
2. **Start development server:**  
   `npm start`

---

## API Endpoints

| Method | Endpoint           | Description                         | Access      |
| ------ | ------------------ | ----------------------------------- | ----------- |
| POST   | /tickets/          | Create a new support ticket         | User/Admin  |
| GET    | /tickets/          | List tickets; filter by status/priority/user | User/Admin  |
| GET    | /tickets/<id>/     | Retrieve ticket details             | User/Admin  |
| PUT    | /tickets/<id>/     | Update ticket (status, assign, etc) | User/Admin  |
| DELETE | /tickets/<id>/     | Delete a ticket                     | User/Admin  |

- **User:** Can view and modify only their tickets.
- **Admin:** Can manage all tickets.

---

## WebSocket Integration

- Live ticket updates (creation, update, assign, delete) broadcast to all clients.
- Powered by Django Channels and Daphne.

---

## Usage

- Launch backend and frontend locally.
- Visit [http://localhost:3000](http://localhost:3000).
- Log in as normal user or admin.
- Users manage their own tickets; admins manage all tickets.

---

## Contributing

Contributions are welcome! Open issues or submit pull requests for improvements or fixes.

---

## License

MIT License.