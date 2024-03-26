#!/bin/bash

db_path="$HOME/.config/agf/agf.db"

if [ ! -f "$db_path" ]; then
  echo "Database already does not exist."
  echo "Creating a new, empty database."
  touch "$db_path"
  exit 0
fi

# Delete and recreate the database
rm "$db_path"
touch "$db_path"
echo "Database nuked successfully."