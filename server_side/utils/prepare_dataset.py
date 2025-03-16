import json
import os
import base64

# Function to load a JSON file and convert it into a Python dictionary
def load_json(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        print("File loaded successfully!")
        return data
    except FileNotFoundError:
        print(f"Error: The file {file_path} does not exist.")
    except json.JSONDecodeError:
        print(f"Error: The file {file_path} is not a valid JSON file.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def get_filenames_in_directory(directory_path):
    try:
        # Get a set of filenames in the directory
        filenames = set(os.listdir(directory_path))
        return filenames
    except FileNotFoundError:
        print(f"Error: The directory {directory_path} does not exist.")
        return set()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return set()
    
# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def parse_dataset(images):
    completion_format = json.dumps({
        "labels": [],
        "weather conditions": [],
        "terrain": [],
        "lighting conditions": [],
        "objects of interest": []
    });
    sys_prompt = "Given an image, predict the following fields in a JSON dict: " + completion_format + "."
    
    formatted_data = []
    for img in images.values():
        img_path = "dataset/images/" + img["file_name"]
        base64_img = encode_image(img_path)
        img_url = f"data:image/jpeg;base64,{base64_img}"

        completion = json.dumps({
             "labels": img["labels"],
            "weather conditions": img["contexts"]["weather conditions"],
            "terrain": img["contexts"]["terrain"],
            "lighting conditions": img["contexts"]["lighting conditions"],
            "objects of interest": img["contexts"]["objects of interest"]
        });
        print(img)

        data_line = {
            "messages": [
                {
                    "role": "system",
                    "content": sys_prompt
                },
                {
                    "role": "user",
                    "content": [
                        { "type": "text", "text": "annotate this image:" },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": img_url,
                            },
                        },
                    ],
                },
                {
                    "role": "assistant",
                    "content": completion
                }
            ]
        }

        formatted_data.append(data_line)
    return formatted_data


if __name__ == "__main__":
    file_path = "dataset/coco.json"  
    json_data = load_json(file_path)

    categories = {}
    for c in json_data["categories"]:
        categories[c["id"]] = c["name"]
    
    filenames = get_filenames_in_directory("dataset/images")

    images = {}
    for img in json_data["images"]:
        if img["file_name"] in filenames:
            images[img["file_name"]] = img

    formatted_data = parse_dataset(images) *2

    with open("fine_tune_data/COCO_output.jsonl", "w") as f:
        for item in formatted_data:
            # Write each item (JSON object) as a new line in the JSONL file
            f.write(json.dumps(item) + "\n")

    print("JSONL file has been created!")    
    





