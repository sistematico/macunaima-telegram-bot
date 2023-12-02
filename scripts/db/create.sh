#!/bin/bash

# DB_CONNECTION_STRING=$(grep 'DATABASE_URL' .env | cut -d '=' -f 2- | tr -d '"')

# if [ ! -z "$DB_CONNECTION_STRING" ]; then
#     DB_USER=$(echo $DB_CONNECTION_STRING | sed -e 's/postgresql:\/\///' | sed -e 's/:.*//')
#     DB_PASS=$(echo $DB_CONNECTION_STRING | sed -e 's/.*://' | sed -e 's/@.*//')
#     DB_HOST=$(echo $DB_CONNECTION_STRING | sed -e 's/.*@//' | sed -e 's/:.*//')
#     DB_PORT=$(echo $DB_CONNECTION_STRING | sed -e 's/.*://' | sed -e 's/\/.*//')
#     DB_NAME=$(echo $DB_CONNECTION_STRING | sed -e 's/.*\///' | sed -e 's/\?.*//')

DB_CONNECTION_STRING=$(grep 'DATABASE_URL' .env | cut -d '=' -f 2- | tr -d '"')

if [ ! -z "$DB_CONNECTION_STRING" ]; then
    DB_USER=$(echo $DB_CONNECTION_STRING | sed -e 's/postgresql:\/\///' | cut -d ':' -f 1)
    DB_PASS=$(echo $DB_CONNECTION_STRING | cut -d ':' -f 2 | cut -d '@' -f 1)
    DB_HOST=$(echo $DB_CONNECTION_STRING | cut -d '@' -f 2 | cut -d ':' -f 1)
    DB_PORT=$(echo $DB_CONNECTION_STRING | cut -d ':' -f 3 | cut -d '/' -f 1)
    DB_NAME=$(echo $DB_CONNECTION_STRING | cut -d '/' -f 3 | cut -d '?' -f 1)
    echo "Usuário: $DB_USER"
    echo "Senha:   $DB_PASS"
    echo "Host:    $DB_HOST"
    echo "Porta:   $DB_PORT"
    echo "Banco:   $DB_NAME"
fi

does_db_exist() { 
    su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw $1" 
}

if does_db_exist $DB_NAME; then
    echo "O banco de dados $DB_NAME já existe. O script não será executado."
    exit 0
fi

su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' SUPERUSER;\""
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;\""
#su - postgres -c "psql -c \"ALTER USER $DB_USER WITH SUPERUSER;\""

echo "Configuração do banco de dados para Prisma concluída."