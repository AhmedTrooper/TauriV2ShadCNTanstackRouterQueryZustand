use tauri_plugin_sql::{Migration, MigrationKind};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_download_list_table",
        sql: "CREATE TABLE IF NOT EXISTS DownloadList (
                id INTEGER PRIMARY KEY,
                unique_id TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                failed BOOLEAN DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                format_id TEXT,
                web_url TEXT,
                title TEXT,
                tracking_message TEXT,
                isPaused BOOLEAN DEFAULT 0
            );",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mydatabase.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
