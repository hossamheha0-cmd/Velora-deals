# Velora Deals UAE — Proguard rules for release builds
# القواعد الأساسية للحفاظ على عمل Flutter وDio وFirebase بشكل صحيح بعد الـMinification

-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Dio / OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Firebase (عند تفعيله لاحقًا)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
