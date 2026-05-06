package com.example.breakloop.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_open_events")
data class AppOpenEvent(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val packageName: String,
    val timestamp: Long
)

@Entity(tableName = "completed_actions")
data class CompletedAction(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val actionText: String,
    val userInput: String?,
    val timestamp: Long
)
