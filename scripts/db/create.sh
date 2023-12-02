#!/bin/bash

# Extrair informações do arquivo .env
# DB_USER=$(echo $DB_CONNECTION_STRING | grep -oP '(?<=postgresql:\/\/)[^:]+')
# DB_PASSWORD=$(echo $DB_CONNECTION_STRING | grep -oP '(?<=:)[^@]+')
# DB_NAME=$(echo $DB_CONNECTION_STRING | grep -oP '(?<=\/)[^:?]+')

DB_CONNECTION_STRING=$(grep 'DATABASE_URL' .env | cut -d '=' -f 2-)
# DB_CONNECTION_STRING=$(grep "DATABASE_URL" $ENV_FILE)

if [ ! -z "$DB_CONNECTION_STRING" ]; then
    DB_CREDENTIALS=$(echo $DB_CONNECTION_STRING | sed -e 's/DATABASE_URL="postgresql:\/\/\(.*\)"/\1/')
    DB_USER=$(echo $DB_CREDENTIALS | cut -d ':' -f 1)
    DB_PASS=$(echo $DB_CREDENTIALS | cut -d ':' -f 2 | cut -d '@' -f 1)
    DB_HOST=$(echo $DB_CREDENTIALS | cut -d '@' -f 2 | cut -d ':' -f 1)
    DB_PORT=$(echo $DB_CREDENTIALS | cut -d ':' -f 3 | cut -d '/' -f 1)
    DB_NAME=$(echo $DB_CREDENTIALS | cut -d '/' -f 2 | cut -d '?' -f 1)
fi

# Função para verificar se um banco de dados existe
does_db_exist() {
    su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw $1"
}

# Verificar se o banco de dados já existe
if does_db_exist $DB_NAME; then
    echo "O banco de dados $DB_NAME já existe. O script não será executado."
    exit 0
fi

# Criar usuário e banco de dados
su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;\""

echo "Configuração do banco de dados para Prisma concluída."
