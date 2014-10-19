from readthedocs.settings.base import *  # noqa


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'docs',
        'USER': 'docs',
        'PASSWORD': 'password',
        'HOST': 'database_1',
        'PORT': '5432',
    }
}


LOG_FORMAT = "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s"
LOGGING['loggers'] = {
    '': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

DEBUG = True
TEMPLATE_DEBUG = False
CELERY_ALWAYS_EAGER = False

MEDIA_URL = 'https://media.readthedocs.org/'
STATIC_URL = 'https://media.readthedocs.org/static/'
ADMIN_MEDIA_PREFIX = MEDIA_URL + 'admin/'
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"

# TODO
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.solr_backend.SolrEngine',
        'URL': 'http://odin:8983/solr',
    }
}

# TODO
CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': 'localhost:6379',
        'PREFIX': 'docs',
        'OPTIONS': {
            'DB': 1,
            'PARSER_CLASS': 'redis.connection.HiredisParser'
        },
    },
}


REDIS = {
    'host': 'redis_1',
    'port': 6379,
    'db': 0,
}


# TODO
# Elasticsearch settings.
ES_HOSTS = ['backup:9200', 'db:9200']
ES_DEFAULT_NUM_REPLICAS = 1
ES_DEFAULT_NUM_SHARDS = 5

SLUMBER_API_HOST = 'https://readthedocs.org'
WEBSOCKET_HOST = 'websocket.readthedocs.org:8088'

PRODUCTION_DOMAIN = 'readthedocs.org'
USE_SUBDOMAIN = True
NGINX_X_ACCEL_REDIRECT = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Lock builds for 10 minutes
REPO_LOCK_SECONDS = 300

# Don't re-confirm existing accounts
ACCOUNT_EMAIL_VERIFICATION = 'none'

# set GitHub scope
SOCIALACCOUNT_PROVIDERS = {
    'github': { 'SCOPE': ['user:email', 'public_repo', 'read:org', 'admin:repo_hook', 'repo:status']}
}

