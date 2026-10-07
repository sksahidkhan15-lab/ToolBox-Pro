package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import java.io.File

class MainActivity : ComponentActivity() {

  private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

  private val filePickerLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      val uriList = mutableListOf<Uri>()
      if (result.resultCode == RESULT_OK) {
        val data = result.data
        if (data != null) {
          if (data.clipData != null) {
            val count = data.clipData!!.itemCount
            for (i in 0 until count) {
              uriList.add(data.clipData!!.getItemAt(i).uri)
            }
          } else if (data.data != null) {
            uriList.add(data.data!!)
          }
        }
      }
      fileChooserCallback?.onReceiveValue(
        if (uriList.isNotEmpty()) uriList.toTypedArray() else null
      )
      fileChooserCallback = null
    }

  private val cameraPermissionLauncher =
    registerForActivityResult(ActivityResultContracts.RequestPermission()) { _ ->
      // Permission result handled
    }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Explicitly disable hardware acceleration window flag
    window.clearFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)

    // Pre-create Chromium Code Cache & HTTP Cache directories to prevent opendir / simple_index_file error
    try {
      val base = cacheDir
      val cacheDirs = listOf(
        File(base, "WebView/Default/HTTP Cache/Code Cache/js"),
        File(base, "WebView/Default/HTTP Cache/Code Cache"),
        File(base, "WebView/Default/HTTP Cache"),
        File(base, "WebView/Default/Code Cache/js"),
        File(base, "WebView/Default/Code Cache"),
        File(base, "WebView/Default")
      )
      for (dir in cacheDirs) {
        if (!dir.exists()) {
          dir.mkdirs()
        }
      }
    } catch (_: Exception) {
      // Ignore directory creation failure
    }

    // Request Camera permission for QR scanning if needed
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
      != PackageManager.PERMISSION_GRANTED) {
      cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
    }

    val webView = WebView(this).apply {
      // Use software rendering layer to avoid MESA DRM rendernode issues in cloud emulator
      setLayerType(View.LAYER_TYPE_SOFTWARE, null)

      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = true
        allowFileAccess = true
        allowContentAccess = true
        @Suppress("DEPRECATION")
        allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        allowUniversalAccessFromFileURLs = true
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        mediaPlaybackRequiresUserGesture = false
        cacheMode = WebSettings.LOAD_DEFAULT
      }

      webViewClient = object : WebViewClient() {
        override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
          // Gracefully prevent app crash if renderer process exits
          return true
        }
      }

      webChromeClient = object : WebChromeClient() {
        override fun onShowFileChooser(
          webView: WebView?,
          filePathCallback: ValueCallback<Array<Uri>>?,
          fileChooserParams: FileChooserParams?
        ): Boolean {
          fileChooserCallback?.onReceiveValue(null)
          fileChooserCallback = filePathCallback

          val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "*/*"
            addCategory(Intent.CATEGORY_OPENABLE)
          }

          try {
            filePickerLauncher.launch(intent)
          } catch (e: Exception) {
            fileChooserCallback?.onReceiveValue(null)
            fileChooserCallback = null
            return false
          }
          return true
        }

        override fun onPermissionRequest(request: PermissionRequest?) {
          request?.grant(request.resources)
        }
      }

      loadUrl("file:///android_asset/index.html")
    }

    setContentView(webView)
  }
}
