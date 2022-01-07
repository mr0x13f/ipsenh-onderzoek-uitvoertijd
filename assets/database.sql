DROP TABLE IF EXISTS code;

CREATE TABLE code (
    id SERIAL,
    source_code VARCHAR,
    minified_code VARCHAR
);