FROM ruby:2.6

# throw errors if Gemfile has been modified since Gemfile.lock
# RUN bundle config --global frozen 1

RUN mkdir -p /usr/src/back-derails
WORKDIR /usr/src/back-derails

RUN apt-get update && apt-get install -y nodejs --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y mysql-client postgresql-client sqlite3 --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY Gemfile /usr/src/back-derails/

# Uncomment the line below if Gemfile.lock is maintained outside of build process
COPY Gemfile.lock /usr/src/back-derails/

RUN bundle install

COPY . /usr/src/back-derails

EXPOSE 3000
CMD ["rails", "s", "-d", "-b", "0.0.0.0"]
