# School Communication App

## Overview
A comprehensive mobile application built with Expo/React Native for facilitating communication between Teachers, Parents, and School Administrators. The app streamlines attendance tracking, homework management, announcements, chat, fee reminders, and more.

## Purpose
- Enable seamless communication between teachers, parents, and school administrators
- Digitize school operations including attendance, homework, and announcements
- Provide real-time updates and notifications to parents about their children
- Centralize school management tasks for administrators

## Target Users
1. **Teachers** - Track attendance, assign homework, share announcements, communicate with parents
2. **Parents** - Monitor child's attendance, homework, fees, results, and communicate with teachers
3. **Administrators** - Manage users, classes, view analytics, oversee all school operations

## Key Problems Solved
- Manual attendance tracking and paper-based records
- Delayed parent-teacher communication
- Missed announcements and important updates
- Inefficient homework assignment and tracking
- Fee payment reminders and tracking
- Lack of centralized student information

## Current State
**Project Started:** November 18, 2025
**Status:** Initial setup and development in progress

## Recent Changes
- November 18, 2025: Project initialization, backend structure created
- Database schema designed for all modules
- Authentication system with role-based access control

## Project Architecture

### Tech Stack
**Mobile App:**
- Expo SDK (React Native)
- React Navigation (routing)
- React Native Paper (UI components)
- Expo Notifications (push notifications)
- AsyncStorage (local persistence)
- Axios (API communication)

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- JWT authentication
- Socket.io (real-time chat)
- Multer (file uploads)

### Core Features
1. **Authentication** - Role-based login (Teacher/Parent/Admin)
2. **Attendance** - Daily tracking with parent notifications
3. **Homework** - Assignment creation, submission, tracking
4. **Announcements** - Priority-based messaging system
5. **Chat** - Real-time teacher-parent messaging
6. **Fee Reminders** - Payment tracking and alerts
7. **Results** - Student report cards and grades
8. **Gallery** - Photo sharing for school events
9. **Diary** - Daily updates and class schedules
10. **Push Notifications** - Real-time alerts for all activities
11. **Admin Dashboard** - User and class management

### Database Schema
- users (teachers, parents, admins)
- students (linked to parents)
- classes (grades and sections)
- attendance records
- homework assignments
- announcements
- chat messages
- fee records
- results/grades
- gallery albums and photos
- diary entries
- notifications

## User Preferences
- Clean, modern mobile UI
- Intuitive navigation with role-specific screens
- Real-time updates and notifications
- Secure authentication and data protection
