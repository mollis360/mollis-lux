-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION prevent_mollis_lux_room_category_cardinality_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'MOLLIS LUX room categories are fixed and cannot be deleted.'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'INSERT' AND (SELECT count(*) FROM room_categories) >= 4 THEN
    RAISE EXCEPTION 'MOLLIS LUX has exactly four fixed room categories.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS room_categories_fixed_inventory_guard ON room_categories;
--> statement-breakpoint

CREATE TRIGGER room_categories_fixed_inventory_guard
BEFORE INSERT OR DELETE ON room_categories
FOR EACH ROW
EXECUTE FUNCTION prevent_mollis_lux_room_category_cardinality_change();
