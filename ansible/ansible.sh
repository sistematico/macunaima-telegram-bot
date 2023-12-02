#!/bin/bash

export ANSIBLE_HOST_KEY_CHECKING=False

ansible-playbook -i hosts playbook.yml --ask-vault-pass