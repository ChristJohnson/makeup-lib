import { createClient } from "@supabase/supabase-js";

export const name = "makeup-api-supabase";

// TODO(chantel): fill in the blanks
// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://xyzcompany.supabase.co",
  "public-anon-key"
);

/*
Chris' thoughts on the tables:

users(unique user_id, name, email, age) -- one-to-one
unique user_id: unique autoincrement column
name: display name of user
email: email address of user -- this *should* be unique, but not guaranteed
age: age of user

user_palettes(user_id, palette_id) -- one-to-many
user_id: respectively
palette_id: respectively

palettes(uinique palette_id, palette_name, palette_data) -- one-to-one
unique palette_id: unique autoincrement column
palette_name: display name for palette
palette_data: stores _important_ data (i.e. ids from makeup-api.herokuapp.com)

Maybe a view or two for easier insertion/selection?
IDK, but you gotta work with the functions below without changing their
signatures.

I've also included some Object Constructors that might help. I wrote in some
examples I used for testing purposes, to make sure everything in the API worked.

*/

function User(name, email, age) {
  this.name = name;
  this.email = email;
  this.age = age;
}

function Palette(name, data) {
  this.name = name;
  this.data = data;
}

/**
 * If the combination exists, returns the associated user_id.
 * Otherwise, adds an entry to the users table.
 * HINT: this one will need at least 2 queries
 * @return the associated user_id
 */
export function addUser(name, email, age) {
  return 1;
}

/**
 * @return user data based on user_id
 */
export function getUser(user_id) {
  // TODO(chantel): replace with actual query
  return new User("Chris Johnson", "test@example.com", 22);
}

/**
 * Adds an entry to the palettes table and relates it to a user in the
 * user_palettes table
 * @returns the associated palette_id
 */
export function addPalette(user_id, palette_name, palette_data) {
  return 1;
}

/**
 * @return palette based on palette_id
 */
export function getPalette(palette_id) {
  return new Palette("Foo", 113, 492, 1004);
}

/**
 * @return all palettes related to a user_id (array)
 */
export function getPalettesByUser(user_id) {
  return [
    new Palette("Foobar?", [1, 2, 3, 4, 5]),
    new Palette("FizzBuzz", [1, 2, 4, 6, 7]),
  ];
}
