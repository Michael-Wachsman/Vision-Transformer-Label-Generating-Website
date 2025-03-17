This is the first of three ReadMe’s for this project. This first one will cover the general architecture of what I've built, and the next two — one in the client-side folder and one in the server-side folder — will guide you on how to start up the front-end and back-end.

Personal Acknowledgment:
I want to be upfront: I unfortunately did not get to finish everything I wanted to for this project. This was my first time working with fine-tuning a large language model or using a vision transformer. A lot of my development time was spent learning through each task, and this is partially why inconsistent styles may be seen across the different files I provided. As I progressed and learned more, my style evolved, and I currently lack the time to go back and standardize everything. I certainly plan to come back to this project in the future to complete it for my own understanding, since it was actually a lot of fun.

Architecture:
The front-end is built with React, while the back-end is built with Node.js, utilizing a Dockerized MySQL database for image and annotation storage. Axios is used for making requests on the front end. The OpenAI GPT-4o model is leveraged for the image annotation workflow. However, this is fine-tuned based on the dataset provided. In the future, it can also be fine-tuned based on any annotations the user approves or edits in.

Backend Utilities:
In the backend utilities folder, there are two scripts called prepare_dataset, which parse the provided annotation labels into a format that can be used for fine-tuning GPT for image annotation. There are two prepare_dataset scripts: the original one was written in Python, and I later converted it into JavaScript so it could be integrated into the website pipeline whenever the user provides annotation feedback in order to further fine tune the model.

Front-End:
On the home page, the user can upload as many files as they like by clicking the "Upload Images" button. Once the images are uploaded, they will be provided with the generated annotations for each image. Users can then choose to accept or reject each set of annotations. Additionally, users have the option to edit the annotations to better fit their preferred subject matter or format. The user-entered and approved annotations can later be used to further fine-tune the GPT model.

On the dashboard page, there is a minimal grid showing the accuracies of each batch and how many images were processed by the model in each batch.


Future Work:
Here is the roadmap for how I would bring the project to completion:

I would rework the annotation generation workflow so that all the annotations for each image can be generated in parallel, rather than sequentially.
I would complete the active-learning pipeline by expanding the fine-tuning script into one that can be applied to the data stored from the approved and edited annotations in the database, using them for supervised training.
I would finish the dashboard page, allowing the user to get a breakdown of the model’s performance across several different categories. This would be done by feeding the superset of all labels generated in the annotations to a ChatGPT instance, allowing it to create generalized labels. I would then filter each annotation for these labels using further GPT prompts for a hyper specific metric system. Of course I would also present which images fall into each category to the user to ensure metric transparency.
