docker pull mysql:latest


#if a volume exists run the below line
# -p mapps from the docker port 3306 to my port 3307
docker run -d --name test-mysql -e MYSQL_ROOT_PASSWORD=strong_password \
    -p 3307:3306 \
    -v ./init_scripts:/docker-entrypoint-initdb.d \
    -v test-mysql-data:/var/lib/mysql \
    mysql
