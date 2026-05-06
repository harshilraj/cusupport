package com.example.breakloop

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.breakloop.data.local.AppDatabase
import com.example.breakloop.ui.theme.*
import kotlinx.coroutines.flow.first

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            BreakloopTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val context = LocalContext.current
    var hasOverlayPermission by remember { mutableStateOf(android.provider.Settings.canDrawOverlays(context)) }
    var hasAccessibilityPermission by remember { mutableStateOf(checkAccessibilityPermission(context)) }

    // Re-check permissions on resume
    LaunchedEffect(Unit) {
        hasOverlayPermission = android.provider.Settings.canDrawOverlays(context)
        hasAccessibilityPermission = checkAccessibilityPermission(context)
    }

    Scaffold(
        containerColor = BgDark
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Breakloop", color = TextPrimary, fontSize = 36.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(48.dp))

            if (!hasOverlayPermission || !hasAccessibilityPermission) {
                Text("Setup Required", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(16.dp))
                Text("We need these permissions to detect when you open distracting apps and show the interruption screen.", color = TextSecondary, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(32.dp))

                PermissionCard(
                    title = "Display over other apps",
                    description = "Required to show the full-screen interruption.",
                    isGranted = hasOverlayPermission,
                    onClick = {
                        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                        context.startActivity(intent)
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                PermissionCard(
                    title = "Accessibility Service",
                    description = "Required to detect when Instagram, X, or YouTube opens.",
                    isGranted = hasAccessibilityPermission,
                    onClick = {
                        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                        context.startActivity(intent)
                    }
                )
            } else {
                StatsScreen()
            }
        }
    }
}

@Composable
fun PermissionCard(title: String, description: String, isGranted: Boolean, onClick: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardColor),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                if (isGranted) {
                    Text("Granted", color = AccentColor, fontWeight = FontWeight.Bold)
                } else {
                    Button(
                        onClick = onClick,
                        colors = ButtonDefaults.buttonColors(containerColor = AccentColor, contentColor = BgDark)
                    ) {
                        Text("Enable")
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(description, color = TextSecondary, fontSize = 14.sp)
        }
    }
}

@Composable
fun StatsScreen() {
    val context = LocalContext.current
    val db = AppDatabase.getDatabase(context)
    val dao = db.appDao()

    var totalInterruptions by remember { mutableStateOf(0) }
    var actionsCompleted by remember { mutableStateOf(0) }
    var appStats by remember { mutableStateOf<List<com.example.breakloop.data.local.AppStat>>(emptyList()) }

    LaunchedEffect(Unit) {
        val todayStart = System.currentTimeMillis() - (24 * 60 * 60 * 1000) // Rough 24h
        dao.getInterruptionsSince(todayStart).collect { totalInterruptions = it }
    }
    LaunchedEffect(Unit) {
        dao.getTotalCompletedActions().collect { actionsCompleted = it }
    }
    LaunchedEffect(Unit) {
        dao.getAppOpenStats().collect { appStats = it }
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Your Stats", color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        
        StatItem("Interruptions Today", totalInterruptions.toString())
        Spacer(modifier = Modifier.height(16.dp))
        StatItem("Actions Completed", actionsCompleted.toString())
        
        if (appStats.isNotEmpty()) {
            Spacer(modifier = Modifier.height(24.dp))
            Text("App Opens", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(12.dp))
            
            appStats.forEach { stat ->
                val appName = when(stat.packageName) {
                    "com.instagram.android" -> "Instagram"
                    "com.twitter.android" -> "X (Twitter)"
                    "com.google.android.youtube" -> "YouTube"
                    "com.reddit.frontpage" -> "Reddit"
                    else -> stat.packageName
                }
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(appName, color = TextSecondary, fontSize = 16.sp)
                    Text(stat.openCount.toString(), color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardColor, shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
            .padding(20.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = TextSecondary, fontSize = 18.sp)
        Text(value, color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
    }
}

fun checkAccessibilityPermission(context: android.content.Context): Boolean {
    var accessibilityEnabled = 0
    val service = "${context.packageName}/${com.example.breakloop.service.AppDetectionService::class.java.canonicalName}"
    try {
        accessibilityEnabled = Settings.Secure.getInt(
            context.applicationContext.contentResolver,
            Settings.Secure.ACCESSIBILITY_ENABLED
        )
    } catch (e: Settings.SettingNotFoundException) {
    }
    val stringColonSplitter = android.text.TextUtils.SimpleStringSplitter(':')
    if (accessibilityEnabled == 1) {
        val settingValue = Settings.Secure.getString(
            context.applicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        if (settingValue != null) {
            stringColonSplitter.setString(settingValue)
            while (stringColonSplitter.hasNext()) {
                val accessibilityService = stringColonSplitter.next()
                if (accessibilityService.equals(service, ignoreCase = true)) {
                    return true
                }
            }
        }
    }
    return false
}
