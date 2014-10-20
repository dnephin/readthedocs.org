

FROM    dockerfile/elasticsearch

RUN     apt-get update && apt-get install -y \
            python-virtualenv \
            python-pip

WORKDIR /search
ADD     requirements.txt   /search/requirements.txt
RUN     virtualenv .venv && \
        .venv/bin/pip install -r requirements.txt

ADD     elasticsearch.yml /elasticsearch/config/elasticsearch.yml

RUN     /elasticsearch/bin/plugin -install \
            elasticsearch/elasticsearch-analysis-icu/2.3.0

# TODO: deal with copied file indexes.py
ADD     .   /search

RUN     /elasticsearch/bin/elasticsearch & \
        sleep 8 && \
        curl -s localhost:9200/_nodes/_all/plugins | python -m json.tool && \
        .venv/bin/python create_index.py
