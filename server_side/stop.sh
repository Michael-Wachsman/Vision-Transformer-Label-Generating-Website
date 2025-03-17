

docker stop test-mysql; docker rm test-mysql

# comment out the 3 lines below line if you want database info to persist after closing the image
docker volume rm test-mysql-data
folder_path="./uploads"
rm -rf "$folder_path"/*