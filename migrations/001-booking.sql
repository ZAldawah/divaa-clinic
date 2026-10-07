-- Run only during setup. UTC epoch millisecond ranges preserve exact half-open buffers.
CREATE TABLE booking_settings(id integer PRIMARY KEY CHECK(id=1),version integer NOT NULL,body text NOT NULL);
CREATE TABLE booking_reservations(
 id text PRIMARY KEY,request_hash text NOT NULL,service_id text NOT NULL,
 start bigint NOT NULL,"end" bigint NOT NULL,occupied_start bigint NOT NULL,occupied_end bigint NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','confirmed','review','rejected')),
 contact text,created_at bigint NOT NULL,version integer NOT NULL DEFAULT 1,
 CHECK(occupied_start<=start AND start<"end" AND "end"<=occupied_end),
 CHECK(occupied_start>=-8640000000000000 AND occupied_end<=8640000000000000),
 EXCLUDE USING gist (int8range(occupied_start,occupied_end,'[)') WITH &&) WHERE(status!='rejected')
);
CREATE TABLE booking_jobs(
 reservation_id text PRIMARY KEY REFERENCES booking_reservations(id),
 next_at timestamptz NOT NULL DEFAULT clock_timestamp(),lease_until timestamptz,
 lease_token text,attempted boolean NOT NULL DEFAULT false,attempts integer NOT NULL DEFAULT 0
);
CREATE INDEX booking_jobs_due ON booking_jobs(next_at,reservation_id);
CREATE TABLE booking_admins(user_id text PRIMARY KEY);
CREATE TABLE booking_tokens(id integer PRIMARY KEY CHECK(id=1),value text NOT NULL);
CREATE TABLE booking_oauth_state(hash text PRIMARY KEY,session_id text NOT NULL,verifier text NOT NULL,expires bigint NOT NULL);
CREATE TABLE booking_limits(key text PRIMARY KEY,count bigint NOT NULL,expires timestamptz NOT NULL);
CREATE TABLE booking_mock_events(id text PRIMARY KEY,body text NOT NULL);
CREATE TABLE booking_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor text NOT NULL,reservation_id text NOT NULL,action text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
