FROM postgres:17.6-trixie

# Overcome bad proxy and install postgis extension (Not activated)
RUN echo 'Acquire::http::Pipeline-Depth 0;\nAcquire::http::No-Cache true;\nAcquire::BrokenProxy    true;' >  /etc/apt/apt.conf.d/99fixbadproxy &&\
  apt-get update && \
  apt-get install -y postgresql-17-postgis-3 && \
  rm -rf /var/lib/apt/lists/*
