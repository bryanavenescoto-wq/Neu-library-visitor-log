## 🏛️ NEU Library Visitor Log System
A web-based NEU Library Visitor Log System that uses Firebase Authentication to securely record visits and provides a dashboard for viewing and filtering visitor statistics.

## 🌐 Live App 
https://neu-library-visitor-log-fhju.vercel.app/

## ⚙️TechStack
- HTML
- CSS
- JavaScript
- Firebase
- Vercel
- Chart.js
- Lucide Icons 

## 📌Features
- User Authentication – Secure login and registration using Firebase (email/password or Google).
- Visitor Logging – Record visitor details like name, purpose, college, and employee type.
- Real-Time Database – Stores and syncs visitor data instantly using Firebase Firestore.
- Analytics Dashboard – View visitor statistics and trends.
- Filtering System – Filter data by date range, purpose, college, and user type.
- Responsive UI – Clean interface that works on desktop and mobile.
- Cloud Deployment – Hosted online using Vercel for easy access anywhere.

## 🗄️ Database Structure
The application uses Firebase Firestore with the following collections:
- users – Stores user account information (name, email, role)
- visitors – Main collection that stores visitor logs (name, college, purpose, type, date, time in/out)
- logs – Tracks system actions such as adding or updating visitor record

## 👤 Test Account Access
You can log in using Google Authentication or use the demo account below:
- Email: admin@neu.edu.ph  
- Password: neu123

##  📄 License
© 2026 New Era University Library. All rights reserved.
