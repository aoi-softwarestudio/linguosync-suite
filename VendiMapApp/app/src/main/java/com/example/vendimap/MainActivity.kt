package com.example.vendimap

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.vendimap.theme.VendiMapTheme
import androidx.activity.result.contract.ActivityResultContracts
import android.Manifest

class MainActivity : ComponentActivity() {

    // Request permissions for Geolocation API inside WebView
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        // Handle permissions response if needed
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Request location permissions at runtime
        requestPermissionLauncher.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )

        var webView: WebView? = null
        setContent {
            VendiMapTheme {
                androidx.activity.compose.BackHandler(enabled = true) {
                    if (webView?.canGoBack() == true) {
                        webView?.goBack()
                    } else {
                        finish()
                    }
                }
                AndroidView(
                    factory = { context ->
                        WebView(context).apply {
                            webViewClient = WebViewClient()
                            webChromeClient = object : WebChromeClient() {
                                override fun onGeolocationPermissionsShowPrompt(
                                    origin: String?,
                                    callback: GeolocationPermissions.Callback?
                                ) {
                                    // Grant geolocation permission automatically in WebView
                                    callback?.invoke(origin, true, false)
                                }
                            }
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.setGeolocationEnabled(true)
                            settings.databaseEnabled = true
                            
                            // Support local dev server (10.0.2.2 for Android Emulator)
                            // Change this to the production Render URL when releasing
                            loadUrl("https://socialintent-trends.onrender.com/index.html")
                            webView = this
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}
