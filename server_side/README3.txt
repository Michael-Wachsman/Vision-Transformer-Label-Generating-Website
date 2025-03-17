Before starting the backend for the first time, dont forget to run the following lines in the terminal.
npm install openai
npm install sharp
npm install multer

To get the backend started, in this directory, run: 
./start.sh

Then wait about 30-60 seconds for the container to fully setup in the background (there is currently no visual feedback for this). Then run:

./run_endpoint.sh

If it immediately throws `Error connection lost: The server closed the connection.`, terminate the process and try ./run_endpoint again in a few seconds. This is likely due to the docker container not being fully loaded.


To stop the server, terminate the current endpoint process with control C, then  in this directory run:
./stop.sh

If you want to have the data in this db persist between server runs, comment out lines 6,7, and from stop.sh



To fine tune a GPT instance, run the following line in the terminal:
node fine_tune.js
Then copy the outputted job id into the job_id variable in endpoint.js
