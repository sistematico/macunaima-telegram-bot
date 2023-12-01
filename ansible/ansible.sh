#!/bin/bash

export ANSIBLE_HOST_KEY_CHECKING=False
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
#ansible-playbook -i inventory.ini playbook.yml -e '@secret.yml' --ask-vault-pass="$1"