# 🚀 EmployeeFlow

A modern, real-time **Employee Management & Task Tracking** web application built using **React + TypeScript**.  
Created by **Sami**, EmployeeFlow helps businesses manage employees, track tasks, monitor attendance, communicate instantly, and improve workflow efficiency — all without a backend.

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Detailed Feature Explanation](#-detailed-feature-explanation)
- [Planned Improvements](#-planned-improvements)
- [Author](#-author)
- [License](#-license)

---

## 📌 Overview

**EmployeeFlow** is designed for small to medium businesses that want to manage employees and tasks efficiently.  
It includes role-based accounts, task pipelines, attendance tracking, private messaging, AI-powered checklist generation, and downloadable analytics — all running on **LocalStorage/LocalDB**.

The app feels like a real SaaS platform with real-time behavior and clean UI.

---

## 💡 Features

### 🔐 Authentication & Roles

- Admin, Administrator, Employee sign-in system
- Admin can create both Employees and Administrators
- Auto-generated password when creating a new user
- First-time login = must change password
- All login states saved in LocalStorage

---

### 👥 User Management

- Upload profile picture (not random images)
- Profile page with editable phone number
- Admin can download employee info (CSV/PDF)
- Users displayed with **role-based colors**
- Search employees that haven't been messaged yet

---

### 📋 Task Management (Admin & Employee)

- Kanban-style task board: **To Do → Processing → Done**
- Real-time drag-and-drop
- Admin can **create, edit, delete, reassign tasks**
- AI-generated checklist from task description
- Employees can:
  - View tasks assigned to them
  - Tick checklist items
  - Upload work (PDF, code via highlight.js, links)
  - Move tasks only between allowed stages
- Notifications redirect users to the relevant task

---

### 🧠 AI Assistant

- Sidebar AI assistant to answer everything related to:
  - Tasks
  - Employees
  - Performance insights
  - Career suggestions
  - System help

---

### 💬 Messaging System

- Real-time chat
- Employee ↔ Admin chat
- Employee ↔ Employee chat
- New admin accounts automatically get messaging access
- If a user clicks a notification, it redirects to the chat thread

---

### 🕒 Attendance Tracking

**Employees:**

- Check-in / Check-out manually
- Mark themselves present or late
- See who is online / offline

**Admins & Administrators:**

- Daily view and monthly report
- Attendance table: date, employee, status, check-in/out, actions
- Attendance saved to LocalStorage with timestamps
- Employee “Overview” page includes:
  - Profile info
  - Attendance calendar
  - AI-generated “Career Insight” (late, present, performance)

---

### 📊 Dashboards

#### Employee Dashboard:

- Weekly, monthly, yearly attendance dropdown
- Count of:
  - Assigned tasks
  - To-do
  - In progress
  - Completed

#### Admin & Administrator Dashboard:

- Recent activity section
- “Upgrade to Pro” card
- Task analytics
- Downloadable reports (CSV/PDF)

---

### 🌙 UI / UX

- Dark mode toggle
- Clean task cards (smaller, optimized)
- Modern dashboard layout
- Responsive for all devices

---

## 🛠 Tech Stack

| Tech                                    | Purpose                             |
| --------------------------------------- | ----------------------------------- |
| **React (TS)**                          | Main UI framework                   |
| **LocalStorage / LocalDB**              | Data persistence                    |
| **React DnD / Drag-and-Drop libraries** | Task board                          |
| **highlight.js**                        | Code submissions                    |
| **PDF libraries**                       | Work submissions & report downloads |
| **AI model API (optional)**             | Task checklist generation           |
| **CSS / Tailwind / Styled Components**  | UI styling                          |

---

## 🖼 Screenshots

### Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/1.png" alt="Dashboard" width="800" />
</p>

### Task Board

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/2.png" alt="Task Board" width="800" />
</p>

### Messaging & Chat

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/3.png" alt="Messaging" width="800" />
</p>

### Leave Management

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/4.png" alt="Leave Management" width="800" />
</p>

### Attendance Tracker

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/5.png" alt="Attendance Tracker" width="800" />
</p>

### Employees

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/6.png" alt="Employees" width="800" />
</p>

### Audit Logs

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/7.png" alt="Audit Logs" width="800" />
</p>

### Employees & Admin Profile

<p align="center">
  <img src="https://raw.githubusercontent.com/ssamideveloper/employeeflow/main/img/8.png" alt="Employees / Admin Profile" width="800" />
</p>

---

## 📦 Installation

```bash
git clone https://github.com/ssamideveloper/employeeflow.git
cd employeeflow
npm install
npm run dev

🧩 Detailed Feature Explanation

🔐 Authentication Flow

Admin creates Employee/Administrator with auto password
First login forces password update
Login session saved so it never asks again

📋 AI Task Checklist

Admin writes task description
Click Generate Checklist
AI analyzes text and creates a list of steps
Employee sees the checklist and checks off items

📬 Notification Behavior

Task update → opens task
New message → opens chat window
Task finished → admin gets notification

🔮 Planned Improvements

Better sign-in UX
Smarter AI assistant with project-wide context
Richer admin analytics dashboard
Better message search and channel system
Optional backend version with real database

👨‍💻 Author

Sami
📧 Email: samimustafa072@gmail.com

LinkedIn: [samimustafaa](https://www.linkedin.com/in/samimustafaa/)  
GitHub: [ssamideveloper](https://github.com/ssamideveloper)


📄 License

This project is open for educational and portfolio purposes.
You may modify and use it, but please give credit when possible.
```
