# Chatterly - Real-Time Chat Application

## Overview
Chatterly is a real-time chat app where users can join, send messages, and see who’s online. Active users show a **green circle**, inactive users show **grey**.

## Tech Stack
- **Frontend:** React (Next.js), Tailwind CSS  
- **Backend:** Node.js, Express, Socket.IO  
- **Database:** MySQL  

## Database Structure

### Tables

#### `users`
| Column      | Type        | Description                     |
|------------|------------|---------------------------------|
| id         | INT PK AI  | Unique user ID                  |
| name       | VARCHAR    | User’s display name             |
| socket_id  | VARCHAR    | Socket id to ensure session     |

#### `messages`
| Column      | Type       | Description                     |
|------------|-----------|---------------------------------|
| id         | INT PK AI | Unique message ID               |
| sender_id  | VARCHAR   | Sender’s id                     |
| receiver_id| VARCHAR   | Reciever’s id                   |
| content    | TEXT      | Message content                 |
| type       | VARCHAR   | Message type (text/file)        |
| created_at | DATETIME  | Timestamp of message            |

## Technical Approach
- **Realtime Chat:** Socket.IO handles message sending and active user tracking.    
- **Frontend:** `SignUp`, `Chat`, `Inputs` components manage UI and user state.  
- **Backend:** Node.js + Express + Socket.IO manage events:  
  - `new_user` → add active user  
  - `send_message` → broadcast messages  
  - `logout_user` / `disconnect` 

## Setup
1. Clone and install dependencies.  
2. Set up MySQL database with `users` and `messages` tables.  
3. Run backend: `cd server -> npm run dev`  
4. Run frontend: `cd client -> npm run dev`  
5. Open: [http://localhost:3000](http://localhost:3000)
