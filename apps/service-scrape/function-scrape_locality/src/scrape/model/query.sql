-- name: InsertLocality :one
INSERT INTO locality_table (
  boundary_coordinates,
  postcode,
  state_abbreviation,
  suburb_name
)
VALUES ($1, $2, $3, $4)
ON CONFLICT (suburb_name, state_abbreviation, postcode)
DO UPDATE SET
  boundary_coordinates = EXCLUDED.boundary_coordinates,
  postcode = EXCLUDED.postcode,
  state_abbreviation = EXCLUDED.state_abbreviation,
  suburb_name = EXCLUDED.suburb_name
RETURNING id;
