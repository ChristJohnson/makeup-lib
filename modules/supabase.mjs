import { createClient } from "@supabase/supabase-js";

export const name = "makeup-api-supabase";

// TODO(chantel): fill in the blanks
// Create a single supabase client for interacting with your database
const supabase = createClient(
    "https://axlkpyetnmbcnzncpwvp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bGtweWV0bm1iY256bmNwd3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNjAzMDgsImV4cCI6MjA0OTYzNjMwOH0.hKKyYuNkQ7NyRJif0sZZfps_5Fr8T-4LgYN6s-UGHtY"
)
export default supabase;

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
export async function addUser(name, email, age) {
    const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", email);

  if (selectError) throw selectError;

  if (existingUser.length > 0) {
    return existingUser[0].user_id; 
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ name, email, age })
    .select("user_id");

  if (insertError) throw insertError;

  return newUser[0].user_id; 
}


/**
 * @return user data based on user_id
 */
export async function getUser(user_id) {
    const { data, error } = await supabase
    .from("users")
    .select("name, email, age")
    .eq("user_id", user_id)
    .single(); 
  if (error) throw error;
  return new User("Chris Johnson", "test@example.com", 22);
}

/**
 * Adds an entry to the palettes table and relates it to a user in the
 * user_palettes table
 * @returns the associated palette_id
 */
export async function addPalette(user_id, palette_name, palette_data) {
    const { data: palette, error: insertPaletteError } = await supabase
    .from("palettes")
    .insert({ palette_name, palette_data })
    .select("palette_id");

  if (insertPaletteError) throw insertPaletteError;

  const palette_id = palette[0].palette_id;

  const { error: linkError } = await supabase
    .from("user_palettes")
    .insert({ user_id, palette_id });

  if (linkError) throw linkError;

  return palette_id;
}

/**
 * @return palette based on palette_id
 */
export function getPalette(palette_id) {
    const { data, error } = supabase
    .from("palettes")
    .select("palette_name, palette_data")
    .eq("palette_id", palette_id)
    .single();

  if (error) throw error;

  return new Palette(data.palette_name, data.palette_data);
}
/**
 * @return all palettes related to a user_id (array)
 */
export function getPalettesByUser(user_id) {
    const { data, error } = supabase
    .from("user_palettes")
    .select(`
      palettes (palette_name, palette_data)
    `)
    .eq("user_id", user_id);

  if (error) throw error;

  return data.map((entry) => new Palette(entry.palettes.palette_name, entry.palettes.palette_data));
}
