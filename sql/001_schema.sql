CREATE DATABASE IF NOT EXISTS spam_header;
USE spam_header;

CREATE TABLE IF NOT EXISTS processed_messages (
  message_id VARCHAR(255) PRIMARY KEY,
  file_path VARCHAR(1024) NOT NULL,
  envelope_domain VARCHAR(255) NULL,
  from_domain VARCHAR(255) NULL,
  spf_result VARCHAR(32) NOT NULL,
  dkim_result VARCHAR(32) NOT NULL,
  dmarc_result VARCHAR(32) NOT NULL,
  combined_result VARCHAR(128) NOT NULL,
  source_ip VARCHAR(64) NULL,
  asn VARCHAR(32) NULL,
  processed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domain_stats (
  domain VARCHAR(255) PRIMARY KEY,
  total_count BIGINT NOT NULL DEFAULT 0,
  envelope_from_count BIGINT NOT NULL DEFAULT 0,
  header_from_count BIGINT NOT NULL DEFAULT 0,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_ip VARCHAR(64) NULL,
  last_asn VARCHAR(32) NULL
);

CREATE TABLE IF NOT EXISTS auth_result_stats (
  auth_type VARCHAR(16) NOT NULL,
  auth_result VARCHAR(32) NOT NULL,
  encounter_count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (auth_type, auth_result)
);

CREATE TABLE IF NOT EXISTS domain_auth_stats (
  domain VARCHAR(255) NOT NULL,
  auth_type VARCHAR(16) NOT NULL,
  auth_result VARCHAR(32) NOT NULL,
  encounter_count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (domain, auth_type, auth_result)
);

CREATE TABLE IF NOT EXISTS auth_combo_stats (
  spf_result VARCHAR(32) NOT NULL,
  dkim_result VARCHAR(32) NOT NULL,
  dmarc_result VARCHAR(32) NOT NULL,
  encounter_count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (spf_result, dkim_result, dmarc_result)
);

CREATE TABLE IF NOT EXISTS asn_stats (
  asn VARCHAR(32) PRIMARY KEY,
  encounter_count BIGINT NOT NULL DEFAULT 0,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domain_asn_stats (
  domain VARCHAR(255) NOT NULL,
  asn VARCHAR(32) NOT NULL,
  encounter_count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (domain, asn)
);

CREATE TABLE IF NOT EXISTS ip_asn_cache (
  ip VARCHAR(64) PRIMARY KEY,
  asn VARCHAR(32) NOT NULL,
  bgp_prefix VARCHAR(64) NULL,
  country_code VARCHAR(8) NULL,
  registry_name VARCHAR(32) NULL,
  allocated_at VARCHAR(32) NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'team_cymru_dns',
  last_confirmed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW v_domain_list AS
SELECT
  domain,
  total_count,
  envelope_from_count,
  header_from_count,
  last_ip,
  last_asn,
  first_seen_at,
  last_seen_at
FROM domain_stats;
