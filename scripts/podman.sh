#!/bin/bash

# Nome do container
container_name="macunaima_postgres"

# Verifica se o container já existe
if podman container exists $container_name; then
  echo "Container já existe."

  if [[ "$(podman inspect -f '{{.State.Running}}' $container_name)" == "false" ]]; then
    echo "Iniciando o container..."
    podman start $container_name
  else
    echo "Container já está rodando."
  fi
else
  echo "Criando e iniciando um novo container PostgreSQL..."

  podman run --name $container_name \
    -e POSTGRES_USER=macunaima \
    -e POSTGRES_DB=macunaima \
    -e POSTGRES_PASSWORD=macu \
    -p 5432:5432 \
    -d postgres:14.0
fi
