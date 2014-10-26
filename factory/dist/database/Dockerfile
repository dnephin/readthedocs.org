#
# readthedocs.org - database
#

FROM    ubuntu:14.04
MAINTAINER  dnephin@gmail.com

RUN     apt-get update && apt-get install -y \
            postgresql-9.3 \
            postgresql-contrib-9.3

USER    postgres
RUN     echo "host  all  all  0.0.0.0/0  md5" >> /etc/postgresql/9.3/main/pg_hba.conf
RUN     echo "listen_addresses='*'" >> /etc/postgresql/9.3/main/postgresql.conf

ADD     .   /source
RUN     /etc/init.d/postgresql start && \
            psql --command "CREATE USER docs WITH SUPERUSER PASSWORD 'password';" && \
            createdb docs && \
            psql docs < /source/docs.db && \
            /etc/init.d/postgresql stop

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

EXPOSE  5432
CMD ["/usr/lib/postgresql/9.3/bin/postgres", "-D", "/var/lib/postgresql/9.3/main", "-c", "config_file=/etc/postgresql/9.3/main/postgresql.conf"]

