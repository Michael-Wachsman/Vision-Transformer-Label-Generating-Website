import json
import os

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
            images[img["file_name"]] = {"id":img["id"], "labels": img["labels"], "contexts": img["contexts"]}
            print(images[img["file_name"]])
    print(len(images.keys()))
    
    # if json_data:
    #     print("Loaded data:", categories)  # You can print the data or do other operations on it.


