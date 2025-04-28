import { MMKV } from 'react-native-mmkv';
import SQLite from 'react-native-sqlite-storage';

// Initialize storage
export const storage = new MMKV();
export const db = SQLite.openDatabase(
    { name: 'crypto.db', location: 'default' },
    () => console.log('Database opened successfully'),
    error => console.error('Database error:', error)
);

// Constants
const DB_VERSION = 1;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const EXTENDED_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for less frequently changing data

/**
 * Database initialization and migration utility
 */
export const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            // Check current DB version
            const storedVersion = storage.getNumber('db_version') || 0;
            
            db.transaction(tx => {
                // Create tables if they don't exist
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS price_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        crypto_id TEXT,
                        product_id INTEGER,
                        timeframe TEXT,
                        timestamp INTEGER,
                        open REAL,
                        high REAL,
                        low REAL,
                        close REAL,
                        UNIQUE(crypto_id, timeframe, timestamp)
                    );`
                );
                
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS metadata (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        timestamp INTEGER
                    );`
                );
                
                // Create indexes for faster querying
                tx.executeSql(
                    `CREATE INDEX IF NOT EXISTS idx_price_crypto_time 
                     ON price_data(crypto_id, timeframe, timestamp);`
                );
                
                // Run migrations if needed
                if (storedVersion < DB_VERSION) {
                    // Migration logic would go here
                    // Example: tx.executeSql('ALTER TABLE price_data ADD COLUMN new_column TEXT;');
                    
                    // Update stored version
                    storage.set('db_version', DB_VERSION);
                }
                
                resolve(true);
            }, error => {
                console.error('Database initialization error:', error);
                reject(error);
            });
        } catch (error) {
            console.error('Database setup error:', error);
            reject(error);
        }
    });
};

/**
 * Database cleanup and optimization
 * Removes old data to prevent excessive storage usage
 */
export const optimizeStorage = () => {
    return new Promise((resolve, reject) => {
        try {
            const now = Date.now();
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            
            db.transaction(tx => {
                // Remove very old short-term data (older than 1 day for 1D timeframe)
                tx.executeSql(
                    `DELETE FROM price_data 
                     WHERE timeframe = '1D' 
                     AND timestamp < ?`,
                    [oneDayAgo]
                );
                
                // Remove older medium-term data (older than 1 week for 1W timeframe)
                tx.executeSql(
                    `DELETE FROM price_data 
                     WHERE timeframe = '1W' 
                     AND timestamp < ?`,
                    [oneWeekAgo]
                );
                
                // For longer timeframes (1M, 1Y), we keep all data but could implement
                // a strategy to thin out older data points for storage optimization
                
                // Remove expired metadata
                tx.executeSql(
                    `DELETE FROM metadata 
                     WHERE timestamp < ?`,
                    [oneDayAgo]
                );
                
                // Run VACUUM to reclaim space (only occasionally)
                const shouldVacuum = Math.random() < 0.1; // 10% chance to run vacuum
                if (shouldVacuum) {
                    tx.executeSql('VACUUM');
                }
                
                resolve(true);
            }, error => {
                console.error('Storage optimization error:', error);
                reject(error);
            });
        } catch (error) {
            console.error('Storage optimization failed:', error);
            reject(error);
        }
    });
};

/**
 * Intelligent data fetching strategy
 * Decides whether to fetch from storage or API based on data freshness
 */
export const getCryptoData = async (cryptoId, productId, timeframe, fetchFromAPI) => {
    try {
        // Try to get from appropriate storage first
        const shouldUseMMKV = ['1D', '1W'].includes(timeframe);
        
        if (shouldUseMMKV) {
            // Check MMKV for shorter timeframes
            const cachedData = storage.getString(`crypto_${cryptoId}_${timeframe}`);
            const timestamp = storage.getNumber(`crypto_${cryptoId}_${timeframe}_timestamp`);
            
            if (cachedData && timestamp) {
                const dataAge = Date.now() - timestamp;
                const maxAge = timeframe === '1D' ? CACHE_DURATION : EXTENDED_CACHE_DURATION;
                
                // If data is fresh enough, use it
                if (dataAge < maxAge) {
                    return {
                        data: JSON.parse(cachedData),
                        source: 'cache',
                        needsRefresh: dataAge > (maxAge / 2) // Flag for background refresh
                    };
                }
            }
        } else {
            // Try SQLite for longer timeframes
            try {
                const data = await new Promise((resolve, reject) => {
                    db.transaction(tx => {
                        // Check cache freshness
                        tx.executeSql(
                            'SELECT value FROM metadata WHERE key = ?',
                            [`${cryptoId}_${timeframe}_timestamp`],
                            (_, result) => {
                                if (result.rows.length > 0) {
                                    const timestamp = parseInt(result.rows.item(0).value);
                                    const dataAge = Date.now() - timestamp;
                                    const maxAge = EXTENDED_CACHE_DURATION;
                                    
                                    // If too old, reject to trigger refresh
                                    if (dataAge > maxAge) {
                                        reject(new Error('Cache expired'));
                                        return;
                                    }
                                    
                                    // Get data from SQLite
                                    tx.executeSql(
                                        `SELECT * FROM price_data 
                                         WHERE crypto_id = ? AND timeframe = ? 
                                         ORDER BY timestamp ASC`,
                                        [cryptoId, timeframe],
                                        (_, dataResult) => {
                                            if (dataResult.rows.length === 0) {
                                                reject(new Error('No data found'));
                                                return;
                                            }
                                            
                                            const chartData = [];
                                            for (let i = 0; i < dataResult.rows.length; i++) {
                                                const row = dataResult.rows.item(i);
                                                chartData.push({
                                                    date: row.timestamp,
                                                    usd: {
                                                        open: row.open,
                                                        high: row.high,
                                                        low: row.low,
                                                        close: row.close
                                                    }
                                                });
                                            }
                                            
                                            resolve({
                                                data: chartData,
                                                source: 'database',
                                                needsRefresh: dataAge > (maxAge / 2)
                                            });
                                        },
                                        (_, error) => reject(error)
                                    );
                                } else {
                                    reject(new Error('No cache timestamp found'));
                                }
                            },
                            (_, error) => reject(error)
                        );
                    });
                });
                
                return data;
            } catch (error) {
                // Cache miss or error, will fetch from API
                console.log('SQLite cache miss:', error.message);
            }
        }
        
        // If we get here, we need to fetch from API
        const apiData = await fetchFromAPI(cryptoId, productId, timeframe);
        
        // Store the fetched data
        if (shouldUseMMKV) {
            storage.set(`crypto_${cryptoId}_${timeframe}`, JSON.stringify(apiData));
            storage.set(`crypto_${cryptoId}_${timeframe}_timestamp`, Date.now());
        } else {
            await new Promise((resolve, reject) => {
                db.transaction(tx => {
                    // Update timestamp
                    tx.executeSql(
                        'INSERT OR REPLACE INTO metadata (key, value, timestamp) VALUES (?, ?, ?)',
                        [`${cryptoId}_${timeframe}_timestamp`, Date.now().toString(), Date.now()]
                    );
                    
                    // Clear old data for this timeframe
                    tx.executeSql(
                        'DELETE FROM price_data WHERE crypto_id = ? AND timeframe = ?',
                        [cryptoId, timeframe]
                    );
                    
                    // Insert new data
                    const insertPromises = apiData.map(entry => {
                        return new Promise((resInsert, rejInsert) => {
                            tx.executeSql(
                                `INSERT OR REPLACE INTO price_data 
                                (crypto_id, product_id, timeframe, timestamp, open, high, low, close) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    cryptoId,
                                    productId,
                                    timeframe,
                                    entry.date,
                                    entry.usd.open,
                                    entry.usd.high,
                                    entry.usd.low,
                                    entry.usd.close
                                ],
                                (_, resultSet) => resInsert(resultSet),
                                (_, error) => rejInsert(error)
                            );
                        });
                    });
                    
                    Promise.all(insertPromises)
                        .then(() => resolve(true))
                        .catch(error => reject(error));
                });
            });
        }
        
        return {
            data: apiData,
            source: 'api',
            needsRefresh: false
        };
    } catch (error) {
        console.error('Error in getCryptoData:', error);
        throw error;
    }
};

/**
 * Clear storage (useful for debugging or reset)
 */
export const clearStorage = async () => {
    // Clear MMKV
    storage.clearAll();
    
    // Clear SQLite
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM price_data');
            tx.executeSql('DELETE FROM metadata');
            tx.executeSql('VACUUM');
            resolve(true);
        }, error => {
            console.error('Error clearing storage:', error);
            reject(error);
        });
    });
};

/**
 * Get storage stats (useful for monitoring)
 */
export const getStorageStats = async () => {
    // Get SQLite stats
    const dbStats = await new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT name, COUNT(*) as count FROM sqlite_master WHERE type='table'",
                [],
                (_, results) => {
                    const tables = results.rows.length;
                    
                    tx.executeSql(
                        'SELECT COUNT(*) as count FROM price_data',
                        [],
                        (_, countResults) => {
                            const priceDataCount = countResults.rows.item(0).count;
                            
                            resolve({
                                tables,
                                priceDataCount
                            });
                        }
                    );
                },
                (_, error) => reject(error)
            );
        });
    });
    
    // Get MMKV stats - approximation since we can't directly get size
    const mmkvKeys = [];
    storage.getAllKeys().forEach(key => {
        mmkvKeys.push(key);
    });
    
    return {
        sqlite: dbStats,
        mmkv: {
            keyCount: mmkvKeys.length,
            keys: mmkvKeys
        }
    };
};