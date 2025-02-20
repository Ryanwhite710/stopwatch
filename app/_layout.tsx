import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

const createDbIfNeeded = async (db: SQLiteDatabase) => {
  console.log("Creating database");
  try {
    // Create table with correct column names
    const response1 = await db.execAsync(
      "CREATE TABLE IF NOT EXISTS timestudies (id INTEGER PRIMARY KEY AUTOINCREMENT, process TEXT, instance INTEGER, process_step TEXT, time TEXT, note TEXT)"
    );
    const response2 = await db.execAsync(
      "CREATE TABLE IF NOT EXISTS studytemplates (process TEXT, instance INTEGER, process_step TEXTT)"
    );
    console.log("Database created", response1, response2);
  } catch (error) {
    console.error("Error creating database:", error);
  }
};

export default function RootLayout() {
  return (
    <>
      <SQLiteProvider databaseName="timestudies.db" onInit={createDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="auto" />
    </>
  );
}
