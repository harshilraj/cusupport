package com.example.breakloop.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    @Insert
    suspend fun insertAppOpenEvent(event: AppOpenEvent)

    @Query("SELECT COUNT(*) FROM app_open_events WHERE packageName = :packageName AND timestamp > :sinceTimestamp")
    suspend fun countAppOpensSince(packageName: String, sinceTimestamp: Long): Int

    @Insert
    suspend fun insertCompletedAction(action: CompletedAction)

    @Query("SELECT * FROM completed_actions ORDER BY timestamp DESC LIMIT 5")
    suspend fun getRecentActions(): List<CompletedAction>

    @Query("SELECT COUNT(*) FROM app_open_events WHERE timestamp >= :timestamp")
    fun getInterruptionsSince(timestamp: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM completed_actions")
    fun getTotalCompletedActions(): Flow<Int>

    @Query("SELECT packageName, COUNT(*) as openCount FROM app_open_events GROUP BY packageName ORDER BY openCount DESC")
    fun getAppOpenStats(): Flow<List<AppStat>>
}

data class AppStat(val packageName: String, val openCount: Int)
