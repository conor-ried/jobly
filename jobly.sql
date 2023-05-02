\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

\i jobly-schema.sql'pulls the data for tables '
\i jobly-seed.sql  'pulls data for entries into table'

\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

\i jobly-schema.sql
