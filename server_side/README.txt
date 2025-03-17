To get this server started, in this directory run: 
./start.sh

Then wait about 30-60 seconds for the container to fully setup in the background (there is currently no visual feedback for this). Then run:

node endpoint.js

If you get `Error connection lost: The server closed the connection.`, just terminate the process and try node endpoint.js again in a few seconds.


To stop the server, terminate the current endpoint process with control C, then  in this directory run:
./stop.sh

If you want to have the data in this db persist between server runs, comment out line 6 from stop.sh


fix db race condition

npm install openai
npm install sharp
npm install @mui/icons-material