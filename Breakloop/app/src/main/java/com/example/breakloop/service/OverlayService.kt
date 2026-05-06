package com.example.breakloop.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.example.breakloop.ui.overlay.OverlayScreen
import android.os.Build
import android.util.Log

class OverlayService : Service() {

    companion object {
        const val ACTION_SHOW_OVERLAY = "SHOW_OVERLAY"
        const val ACTION_HIDE_OVERLAY = "HIDE_OVERLAY"
        const val EXTRA_PACKAGE_NAME = "PACKAGE_NAME"
        const val EXTRA_IS_LOOPING = "IS_LOOPING"
    }

    private var windowManager: WindowManager? = null
    private var composeView: ComposeView? = null
    
    // Self-contained LifecycleOwner for Compose support
    private val lifecycleOwner = CustomLifecycleOwner()

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        lifecycleOwner.start()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW_OVERLAY -> {
                val packageName = intent.getStringExtra(EXTRA_PACKAGE_NAME) ?: ""
                val isLooping = intent.getBooleanExtra(EXTRA_IS_LOOPING, false)
                showOverlay(packageName, isLooping)
            }
            ACTION_HIDE_OVERLAY -> {
                removeOverlay()
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun showOverlay(packageName: String, isLooping: Boolean) {
        if (composeView != null) return // Already showing

        try {
            composeView = ComposeView(this).apply {
                setViewTreeLifecycleOwner(lifecycleOwner)
                setViewTreeSavedStateRegistryOwner(lifecycleOwner)
                setContent {
                    OverlayScreen(
                        packageName = packageName,
                        isLooping = isLooping,
                        onClose = {
                            removeOverlay()
                            stopSelf()
                        },
                        onHome = {
                            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                                addCategory(Intent.CATEGORY_HOME)
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            }
                            startActivity(homeIntent)
                            removeOverlay()
                            stopSelf()
                        }
                    )
                }
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else
                    WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSLUCENT
            )
            params.gravity = Gravity.CENTER

            windowManager?.addView(composeView, params)
        } catch (e: Exception) {
            Log.e("OverlayService", "Error adding overlay", e)
        }
    }

    private fun removeOverlay() {
        try {
            composeView?.let { windowManager?.removeView(it) }
            composeView = null
        } catch (e: Exception) {
            Log.e("OverlayService", "Error removing overlay", e)
        }
    }

    override fun onDestroy() {
        lifecycleOwner.stop()
        removeOverlay()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
