-- The blue tower became the blacksmith tower: rename its serialized type in every stored board.
UPDATE "player_board"
SET "board" = jsonb_set(
    "board",
    '{elements}',
    (
        SELECT jsonb_agg(
            CASE
                WHEN e->>'kind' = 'tower' AND e->>'type' = 'blue'
                    THEN jsonb_set(e, '{type}', '"blacksmith"')
                ELSE e
            END
        )
        FROM jsonb_array_elements("board"->'elements') AS e
    )
)
WHERE "board"->'elements' @> '[{"kind":"tower","type":"blue"}]';
