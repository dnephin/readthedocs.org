#!/bin/bash

set -eux

export DJANGO_SETTINGS_MODULE="db_factory_settings"

# TODO: in a builer image 
apt-get install -y postgresql-client-9.3 

# TODO: fails if the old volume still exists
psql -h database -U postgres \
    --command "CREATE USER docs WITH SUPERUSER PASSWORD 'password';"
createdb -h database -U postgres docs
../venv/bin/python ./manage.py syncdb --noinput
# See https://github.com/rtfd/readthedocs.org/issues/773
# for the reason behind `migrate projects 0001` line
../venv/bin/python ./manage.py migrate projects 0001
../venv/bin/python ./manage.py migrate
PYTHONPATH=/rtd/readthedocs ../venv/bin/python /build/create_superuser.py
../venv/bin/python ./manage.py loaddata test_data

pg_dump -h database -U postgres docs > /target/docs.db
