ALTER TABLE "public"."messages" ADD COLUMN edited_at TIMESTAMPTZ;

CREATE POLICY "Enable update for messages based on author" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author"));
CREATE FUNCTION messages_update_filter() RETURNS trigger LANGUAGE plpgsql AS
$$ BEGIN
    IF NEW.author <> OLD.author THEN
        RAISE EXCEPTION 'not allowed';
    END IF;
    IF NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'not allowed';
    END IF;

    IF NEW.edited_at IS NULL OR NEW.edited_at > CURRENT_TIMESTAMP OR NEW.edited_at < (CURRENT_TIMESTAMP - INTERVAL '1 minute') THEN
        NEW.edited_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER messages_update_filter BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE PROCEDURE messages_update_filter();

ALTER POLICY "Enable insert for users based on author" ON "public"."messages" RENAME TO "Enable insert for messages based on author";
ALTER POLICY "Enable delete for users based on author" ON "public"."messages" RENAME TO "Enable delete for messages based on author";
ALTER POLICY "Enable insert for messages based on author" ON "public"."messages" WITH CHECK (
    ("auth"."uid"() = "author") AND
    ("created_at" >= (CURRENT_TIMESTAMP - INTERVAL '1 minute')) AND
    ("created_at" <= CURRENT_TIMESTAMP)
); 

