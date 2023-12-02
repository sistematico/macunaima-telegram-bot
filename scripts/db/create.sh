#!/bin/bash

DB_CONNECTION_STRING=$(grep 'DATABASE_URL' .env | cut -d '=' -f 2- | tr -d '"')

if [ ! -z "$DB_CONNECTION_STRING" ]; then
    DB_USER=$(echo $DB_CONNECTION_STRING | sed -e 's/postgresql:\/\///' | sed -e 's/:.*//')
    DB_PASS=$(echo $DB_CONNECTION_STRING | sed -e 's/.*://' | sed -e 's/@.*//')
    DB_HOST=$(echo $DB_CONNECTION_STRING | sed -e 's/.*@//' | sed -e 's/:.*//')
    DB_PORT=$(echo $DB_CONNECTION_STRING | sed -e 's/.*://' | sed -e 's/\/.*//')
    DB_NAME=$(echo $DB_CONNECTION_STRING | sed -e 's/.*\///' | sed -e 's/\?.*//')
fi

does_db_exist() { 
    su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw $1" 
}

if does_db_exist $DB_NAME; then
    echo "O banco de dados $DB_NAME já existe. O script não será executado."
    exit 0
fi

su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\""
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;\""

echo "Configuração do banco de dados para Prisma concluída."