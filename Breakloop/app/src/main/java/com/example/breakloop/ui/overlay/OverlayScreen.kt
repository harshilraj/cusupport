package com.example.breakloop.ui.overlay

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.example.breakloop.data.MicroAction
import com.example.breakloop.data.MicroActionsRepository
import com.example.breakloop.data.local.AppDatabase
import com.example.breakloop.data.local.CompletedAction
import com.example.breakloop.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun OverlayScreen(
    packageName: String,
    isLooping: Boolean,
    onClose: () -> Unit,
    onHome: () -> Unit
) {
    var buttonsEnabled by remember { mutableStateOf(false) }
    var currentScreen by remember { mutableStateOf("INTERRUPT") } // INTERRUPT, ACTIONS, INPUT
    var selectedAction by remember { mutableStateOf<MicroAction?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        delay(2000)
        buttonsEnabled = true
    }

    BreakloopTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BgDark)
                .padding(28.dp),
            contentAlignment = Alignment.Center
        ) {
            when (currentScreen) {
                "INTERRUPT" -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = if (isLooping) "You're looping. Stop." else "Why are you here?",
                            color = TextPrimary,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Be intentional.",
                            color = TextSecondary,
                            fontSize = 20.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(48.dp))

                        Button(
                            onClick = { currentScreen = "ACTIONS" },
                            enabled = buttonsEnabled,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AccentColor,
                                contentColor = BgDark,
                                disabledContainerColor = AccentColor.copy(alpha = 0.5f)
                            ),
                            modifier = Modifier.fillMaxWidth().height(56.dp)
                        ) {
                            Text("Do something better", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        TextButton(
                            onClick = onClose,
                            enabled = buttonsEnabled,
                            modifier = Modifier.fillMaxWidth().height(56.dp)
                        ) {
                            Text("Continue anyway", color = if (buttonsEnabled) TextSecondary else TextSecondary.copy(alpha = 0.5f), fontSize = 16.sp)
                        }
                    }
                }
                "ACTIONS" -> {
                    val actions by remember { mutableStateOf(MicroActionsRepository.getRandomActions(3, emptyList())) }
                    
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("Choose an action", color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        actions.forEach { action ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CardColor),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp)
                            ) {
                                TextButton(
                                    onClick = {
                                        if (action.requiresInput) {
                                            selectedAction = action
                                            currentScreen = "INPUT"
                                        } else {
                                            // Save physical action immediately and go home
                                            scope.launch {
                                                AppDatabase.getDatabase(context).appDao().insertCompletedAction(
                                                    CompletedAction(actionText = action.text, userInput = null, timestamp = System.currentTimeMillis())
                                                )
                                                onHome()
                                            }
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth().padding(16.dp)
                                ) {
                                    Text(action.text, color = TextPrimary, fontSize = 18.sp, textAlign = TextAlign.Center)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        TextButton(onClick = onClose) {
                            Text("Cancel", color = TextSecondary)
                        }
                    }
                }
                "INPUT" -> {
                    var inputText by remember { mutableStateOf("") }
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(selectedAction?.text ?: "", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text("Write your response...") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentColor,
                                unfocusedBorderColor = TextSecondary,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Button(
                            onClick = {
                                scope.launch {
                                    AppDatabase.getDatabase(context).appDao().insertCompletedAction(
                                        CompletedAction(
                                            actionText = selectedAction?.text ?: "",
                                            userInput = inputText,
                                            timestamp = System.currentTimeMillis()
                                        )
                                    )
                                    onHome()
                                }
                            },
                            enabled = inputText.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentColor, contentColor = BgDark),
                            modifier = Modifier.fillMaxWidth().height(56.dp)
                        ) {
                            Text("Mark as done")
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        TextButton(onClick = { currentScreen = "ACTIONS" }) {
                            Text("Back", color = TextSecondary)
                        }
                    }
                }
            }
        }
    }
}
