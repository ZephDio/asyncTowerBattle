-- A stored board has the grid size of its round and a random seed the client's BattleRandomSeed takes, an integer of
-- [0, 2**31), like checkBoard (src/opponents/domain/checked-board.ts) checks before storing it. Rounds past 8 keep the
-- round 8 size. Prisma does not model check constraints. NOT VALID checks every board stored from now on and leaves
-- the boards already stored as they are.
ALTER TABLE "player_board" ADD CONSTRAINT "player_board_board_check" CHECK (
	"round" >= 1
	AND "board"->'round' IS NOT DISTINCT FROM to_jsonb("round")
	AND "board"->'size' IS NOT DISTINCT FROM CASE LEAST("round", 8)
		WHEN 1 THEN '{"width": 8, "height": 6}'::jsonb
		WHEN 2 THEN '{"width": 9, "height": 7}'::jsonb
		WHEN 3 THEN '{"width": 9, "height": 7}'::jsonb
		WHEN 4 THEN '{"width": 11, "height": 7}'::jsonb
		WHEN 5 THEN '{"width": 11, "height": 7}'::jsonb
		WHEN 6 THEN '{"width": 11, "height": 7}'::jsonb
		WHEN 7 THEN '{"width": 11, "height": 7}'::jsonb
		WHEN 8 THEN '{"width": 13, "height": 8}'::jsonb
	END
	AND CASE WHEN jsonb_typeof("board"->'randomSeed') = 'number' THEN
		("board"->>'randomSeed')::numeric BETWEEN 0 AND 2147483647
		AND ("board"->>'randomSeed')::numeric = trunc(("board"->>'randomSeed')::numeric)
	ELSE false END
) NOT VALID;
