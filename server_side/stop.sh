

docker stop test-mysql; docker rm test-mysql

# uncomment below line if you want to delete database info
docker volume rm test-mysql-data

folder_path="./uploads"

# Delete all files in the folder (but keep the folder itself)
rm -rf "$folder_path"/*