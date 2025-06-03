#!/bin/bash

echo "Launching Slackshots..."
cd backend || exit
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID ${BACKEND_PID}"

cd ../frontend || exit
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID ${FRONTEND_PID}"

#Needs to be local host for CORS reasons.
sleep 5
open "http://localhost:5173"

# Wait for both processes
wait ${BACKEND_PID} ${FRONTEND_PID}