-- The castle left the grid: it stands beside the top left cell, where the path now ends and leaves the board by that
-- cell's left edge. A board stored before that has no path tile on its castle's cell (the castle stood on it), so add
-- one there. The castle element keeps its cell, which is the top left cell. No board is added or removed, so the
-- round_board_count projection stays right.
UPDATE "player_board"
SET "board" = jsonb_set(
    "board",
    '{elements}',
    "board"->'elements' || jsonb_build_array(
        jsonb_build_object(
            'kind', 'path',
            'cell', castle.e->'cell',
            'trap', NULL,
            'connectionChoice', NULL
        )
    )
)
FROM (
    SELECT "id", e
    FROM "player_board", jsonb_array_elements("board"->'elements') AS e
    WHERE e->>'kind' = 'castle'
) AS castle
WHERE "player_board"."id" = castle."id"
  AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements("player_board"."board"->'elements') AS other
      WHERE other->>'kind' = 'path' AND other->'cell' = castle.e->'cell'
  );
