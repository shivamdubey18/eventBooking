## Overview

This repository contains two apps:

- `ticket-booking` — backend API using Express and MongoDB
- `ticket-booking-frontend` — React frontend using Create React App

## Start locally

1. Install dependencies in the repo root and both apps:
   cd ticket-booking
   npm install
   cd ../ticket-booking-frontend
   npm install

2. Start both apps concurrently from the repo root:
   npm run dev

3. Backend API runs on `http://localhost:5000` and frontend runs on `http://localhost:3000`.

## Environment variables

The backend uses the following environment variables from `.env`:

- `PORT` — optional API port (default `5000`)
- `MONGODB_URI` — MongoDB connection string (default `mongodb://localhost:27017/ticket-booking`)
