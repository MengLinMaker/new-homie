/* @name upsertLocality */
INSERT INTO locality_table (
    boundary_coordinates,
    postcode,
    state_abbreviation,
    suburb_name
)
VALUES (
    :boundary_coordinates,
    :postcode,
    :state_abbreviation,
    :suburb_name
)
ON CONFLICT (
    suburb_name,
    state_abbreviation,
    postcode
)
DO UPDATE SET
    boundary_coordinates = EXCLUDED.boundary_coordinates,
    postcode = EXCLUDED.postcode,
    state_abbreviation = EXCLUDED.state_abbreviation,
    suburb_name = EXCLUDED.suburb_name
RETURNING id;



/* @name upsertSchoolFeature */
INSERT INTO school_feature_table (
    "primary",
    secondary,
    government_sector,
    independent,
    special_needs
)
VALUES (
    :primary,
    :secondary,
    :government_sector,
    :independent,
    :special_needs
)
ON CONFLICT (
    "primary",
    secondary,
    government_sector,
    independent,
    special_needs
)
DO UPDATE SET
    "primary" = EXCLUDED.primary,
    secondary = EXCLUDED.secondary,
    government_sector = EXCLUDED.government_sector,
    independent = EXCLUDED.independent,
    special_needs = EXCLUDED.special_needs
RETURNING id;



/* @name upsertSchool */
INSERT INTO school_table (
    school_feature_table_id,
    locality_table_id,
    name,
    url,
    acara_id,
    gps
)
VALUES (
    :school_feature_table_id,
    :localityId,
    :name,
    :url,
    :acara_id,
    :gps
)
ON CONFLICT ( acara_id )
DO UPDATE SET
    school_feature_table_id = EXCLUDED.school_feature_table_id,
    locality_table_id = EXCLUDED.locality_table_id,
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    acara_id = EXCLUDED.acara_id,
    gps = EXCLUDED.gps
RETURNING id;



/* @name upsertHomeFeature */
INSERT INTO home_feature_table (
    bath_quantity,
    bed_quantity,
    car_quantity,
    home_type,
    is_retirement
)
VALUES (
    :bath_quantity,
    :bed_quantity,
    :car_quantity,
    :home_type,
    :is_retirement
)
ON CONFLICT (
    bath_quantity,
    bed_quantity,
    car_quantity,
    home_type,
    is_retirement
)
DO UPDATE SET
    bath_quantity = EXCLUDED.bath_quantity,
    bed_quantity = EXCLUDED.bed_quantity,
    car_quantity = EXCLUDED.car_quantity,
    home_type = EXCLUDED.home_type,
    is_retirement = EXCLUDED.is_retirement
RETURNING id;



/* @name upsertHome */
INSERT INTO home_table (
    locality_table_id,
    gps,
    auction_time,
    home_feature_table_id,
    inspection_time,
    land_m2,
    street_address
)
VALUES (
    :locality_table_id,
    :gps,
    :auction_time,
    :home_feature_table_id,
    :inspection_time,
    :land_m2,
    :street_address
)
ON CONFLICT (
    street_address,
    locality_table_id
)
DO UPDATE SET
    locality_table_id = EXCLUDED.locality_table_id,
    gps = COALESCE(EXCLUDED.gps, home_table.gps),
    auction_time = EXCLUDED.auction_time,
    home_feature_table_id = EXCLUDED.home_feature_table_id,
    inspection_time = EXCLUDED.inspection_time,
    land_m2 = GREATEST(EXCLUDED.land_m2, home_table.land_m2),
    street_address = EXCLUDED.street_address
RETURNING id;



/* @name getLastRentScrapeData */
SELECT id, last_scrape_date, weekly_rent_aud
FROM rent_price_table
WHERE home_table_id = :home_table_id
ORDER BY last_scrape_date DESC
LIMIT 1;



/* @name insertRentPriceTable */
INSERT INTO rent_price_table (
    aud_per_bed,
    aud_per_land_m2,
    first_scrape_date,
    last_scrape_date,
    weekly_rent_aud,
    home_table_id
)
VALUES (
    :aud_per_bed,
    :aud_per_land_m2,
    :first_scrape_date,
    :last_scrape_date,
    :weekly_rent_aud,
    :home_table_id
);



/* @name updateSameDayRentPriceTable */
UPDATE rent_price_table
SET
    aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),
    aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),
    weekly_rent_aud = GREATEST(:weekly_rent_aud, weekly_rent_aud)
WHERE id = :id;



/* @name updateSamePriceRentPriceTable */
UPDATE rent_price_table
SET last_scrape_date = :last_scrape_date
WHERE id = :id;



/* @name getLastSaleScrapeData */
SELECT id, last_scrape_date, higher_price_aud
FROM sale_price_table
WHERE home_table_id = :home_table_id
ORDER BY last_scrape_date DESC
LIMIT 1;



/* @name insertSalePriceTable */
INSERT INTO sale_price_table (
    aud_per_bed,
    aud_per_land_m2,
    first_scrape_date,
    last_scrape_date,
    higher_price_aud,
    home_table_id
)
VALUES (
    :aud_per_bed,
    :aud_per_land_m2,
    :first_scrape_date,
    :last_scrape_date,
    :higher_price_aud,
    :home_table_id
);



/* @name updateSameDaySalePriceTable */
UPDATE sale_price_table
SET
    aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),
    aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),
    higher_price_aud = GREATEST(:higher_price_aud, higher_price_aud)
WHERE id = :id;



/* @name updateSamePriceSalePriceTable */
UPDATE sale_price_table
SET last_scrape_date = :last_scrape_date
WHERE id = :id;
