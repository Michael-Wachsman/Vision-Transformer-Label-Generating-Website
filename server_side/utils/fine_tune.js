const { OpenAI } = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.API_KEY,  // Your OpenAI API key from .env
});

const model = "gpt-4o-2024-08-06";

// Function to poll the job status
async function pollJobStatus(jobId) {
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {
    let isJobComplete = false;
    while (!isJobComplete) {
      // Fetch the status of the fine-tuning job
      const jobStatus = await openai.fineTuning.jobs.retrieve(jobId);
      console.log('Job status:', jobStatus.status);

      // Check if the job is complete
      if (jobStatus.status === 'succeeded') {
        console.log('Fine-tuning job completed successfully!');
        isJobComplete = true;
      } else if (jobStatus.status === 'failed') {
        console.error('Fine-tuning job failed.');
        isJobComplete = true;
      } else {
        // Job is still running, wait for a short period before polling again
        console.log('Waiting for job to complete...');
        await delay(5000);  // Wait for 5 seconds before polling again
      }
    }
  } catch (error) {
    console.error('Error retrieving job status:', error);
  }
}

// Main function to execute the fine-tuning job
async function main() {
  // const list = await openai.fineTuning.jobs.list();

  // for await (const fineTune of list) {
  //     console.log(fineTune);
  // }
  // return
  try {
    // Upload the training file for fine-tuning
    const file = await openai.files.create({
      file: fs.createReadStream("fine_tune_data/COCO_output.jsonl"),
      purpose: "fine-tune",
    });
    console.log('File uploaded:', file);

    // Create the fine-tuning job
    const job = await openai.fineTuning.jobs.create({
      training_file: file["id"],
      model: model,
      method: {
        type: "supervised",
        supervised: {
          hyperparameters: { n_epochs: 4 },
        }
      }
    });
    console.log('Job created:', job);

    // Poll job status
    await pollJobStatus(job["id"]);

    console.log("Fine-tuning job processing completed.");
    console.log(job)
  } catch (error) {
    console.error('Error creating fine-tuning job:', error);
  }
}

// Execute main function
main();
