package com.example.breakloop.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.example.breakloop.data.local.AppDatabase
import com.example.breakloop.data.local.AppOpenEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AppDetectionService : AccessibilityService() {

    private val targetApps = setOf(
        "com.instagram.android",
        "com.twitter.android",
        "com.google.android.youtube",
        "com.reddit.frontpage"
    )
    
    // Coroutine scope for database operations
    private val serviceScope = CoroutineScope(Dispatchers.IO)
    private var lastEventTime = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Simple debounce
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastEventTime < 1000) return
        
        if (targetApps.contains(packageName)) {
            lastEventTime = currentTime
            
            serviceScope.launch {
                val db = AppDatabase.getDatabase(applicationContext)
                val dao = db.appDao()
                
                // Track this open event
                dao.insertAppOpenEvent(AppOpenEvent(packageName = packageName, timestamp = currentTime))
                
                // Loop Detection: opened 3 times in 2 minutes
                val twoMinutesAgo = currentTime - (2 * 60 * 1000)
                val opens = dao.countAppOpensSince(packageName, twoMinutesAgo)
                val isLooping = opens >= 3

                // Trigger Overlay Service
                val overlayIntent = Intent(this@AppDetectionService, OverlayService::class.java).apply {
                    action = OverlayService.ACTION_SHOW_OVERLAY
                    putExtra(OverlayService.EXTRA_PACKAGE_NAME, packageName)
                    putExtra(OverlayService.EXTRA_IS_LOOPING, isLooping)
                }
                startService(overlayIntent)
            }
        }
    }

    override fun onInterrupt() {}
}
