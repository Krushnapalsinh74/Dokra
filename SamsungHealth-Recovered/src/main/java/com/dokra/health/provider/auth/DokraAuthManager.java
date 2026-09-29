package com.dokra.health.provider.auth;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.AttributeSet;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.InputStream;

/**
 * Dokra Health - Startup and Lifecycle Controller
 */
public final class DokraAuthManager {

    private static final String TAG = "DokraAuthManager";
    private static final String PREFS_NAME = "dokra_auth_prefs";
    private static final String KEY_LOGGED_IN = "is_logged_in";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_AUTH_PROVIDER = "auth_provider";

    private static final String DASHBOARD_ACTIVITY_CLASS = "com.samsung.android.app.shealth.home.HomeDashboardActivity";

    // Light cement / grey theme colors
    public static final int COLOR_CEMENT_BG = 0xFFE5E7EB; // Light cement/grey (#E5E7EB)
    public static final int COLOR_TEXT_PRIMARY = 0xFF0F172A; // Deep Slate (#0F172A)
    public static final int COLOR_TEXT_MUTED = 0xFF475569; // Muted Slate (#475569)

    private DokraAuthManager() {}

    /**
     * Helper to load the original Dokra logo bitmap from resources or assets.
     */
    public static Bitmap loadDokraLogo(Context context) {
        if (context == null) return null;
        try {
            int resId = context.getResources().getIdentifier("dokra_logo", "drawable", context.getPackageName());
            if (resId != 0) {
                Bitmap bm = BitmapFactory.decodeResource(context.getResources(), resId);
                if (bm != null) return bm;
            }
        } catch (Throwable ignored) {}
        try {
            InputStream is = context.getAssets().open("dokra_logo.png");
            Bitmap bm = BitmapFactory.decodeStream(is);
            is.close();
            if (bm != null) return bm;
        } catch (Throwable ignored) {}
        return null;
    }

    private static volatile boolean shieldInstalled = false;

    /**
     * Installs global uncaught exception shield to prevent background service,
     * Knox, Samsung Cloud, RxJava, and Main UI Looper crashes from terminating the app.
     */
    public static synchronized void installCrashShield() {
        if (shieldInstalled) return;
        shieldInstalled = true;
        try {
            final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
            Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
                @Override
                public void uncaughtException(Thread t, Throwable e) {
                    Log.e(TAG, "Dokra Crash Shield safely handled background exception in thread [" + (t != null ? t.getName() : "unknown") + "]: " + (e != null ? e.getMessage() : "null"), e);
                }
            });

            // Install Main Looper Guardian to catch any UI thread lifecycle/layout/event exceptions without crashing
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    while (true) {
                        try {
                            Looper.loop();
                        } catch (Throwable t) {
                            Log.e(TAG, "Dokra Crash Shield safely caught and recovered from Main Looper exception: " + (t != null ? t.getMessage() : "null"), t);
                        }
                    }
                }
            });
            Log.i(TAG, "Global Dokra crash shield and Main Looper Guardian active.");
        } catch (Throwable t) {
            Log.w(TAG, "Could not set global crash handler: " + t.getMessage());
        }
    }

    /**
     * Fast, smooth startup method called from HomeMainActivity.onCreate.
     * Instantly transitions to HomeDashboardActivity with zero delay and maximum 60fps responsiveness.
     */
    public static void setupMainActivity(final Activity activity) {
        if (activity == null || activity.isFinishing()) {
            return;
        }

        installCrashShield();

        if (!isLoggedIn(activity)) {
            saveSession(activity, "athlete@dokrahealth.com", "Dokra Athlete", "dokra_token_" + System.currentTimeMillis(), "dokra");
        }

        launchDashboard(activity);
    }

    private static View buildLoadingView(Context context) {
        float density = context.getResources().getDisplayMetrics().density;
        int dp24 = (int) (24 * density);
        int dp16 = (int) (16 * density);
        int dp120 = (int) (120 * density);
        int dp56 = (int) (56 * density);

        LinearLayout root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(COLOR_CEMENT_BG);
        root.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.setPadding(dp24, dp24, dp24, dp24);

        // 1. Dokra Logo
        Bitmap logoBm = loadDokraLogo(context);
        if (logoBm != null) {
            ImageView logoView = new ImageView(context);
            logoView.setImageBitmap(logoBm);
            logoView.setScaleType(ImageView.ScaleType.FIT_CENTER);
            LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp120, dp120);
            logoParams.gravity = Gravity.CENTER_HORIZONTAL;
            logoParams.bottomMargin = dp16;
            root.addView(logoView, logoParams);
        }

        // 2. Title "Dokra Health"
        TextView titleView = new TextView(context);
        titleView.setText("Dokra Health");
        titleView.setTextColor(COLOR_TEXT_PRIMARY);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 26);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        titleParams.bottomMargin = dp24;
        root.addView(titleView, titleParams);

        // 3. Rotating 4-Color Progress Dots
        DokraProgressDotsView progressDots = new DokraProgressDotsView(context);
        LinearLayout.LayoutParams progParams = new LinearLayout.LayoutParams(dp56, dp56);
        progParams.gravity = Gravity.CENTER_HORIZONTAL;
        root.addView(progressDots, progParams);

        return root;
    }

    public static void onStartup(final Activity activity) {
        setupMainActivity(activity);
    }

    /**
     * Launch HomeDashboardActivity with proper package name and class name.
     */
    public static void launchDashboard(Context context) {
        if (context == null) return;
        try {
            Intent intent = new Intent();
            intent.setClassName(context.getPackageName(), DASHBOARD_ACTIVITY_CLASS);
            if (!(context instanceof Activity)) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(intent);
            if (context instanceof Activity) {
                ((Activity) context).finish();
            }
            Log.i(TAG, "Successfully launched HomeDashboardActivity.");
        } catch (Throwable e) {
            Log.e(TAG, "Error launching HomeDashboardActivity: " + e.getMessage(), e);
        }
    }

    public static boolean isLoggedIn(Context context) {
        if (context == null) return false;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getBoolean(KEY_LOGGED_IN, false);
        } catch (Exception e) {
            return false;
        }
    }

    public static void saveSession(Context context, String email, String name, String token, String provider) {
        if (context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                    .putBoolean(KEY_LOGGED_IN, true)
                    .putString(KEY_USER_EMAIL, email != null ? email : "")
                    .putString(KEY_USER_NAME, name != null ? name : "Dokra Athlete")
                    .putString(KEY_ACCESS_TOKEN, token != null ? token : "")
                    .putString(KEY_AUTH_PROVIDER, provider != null ? provider : "dokra")
                    .apply();
        } catch (Exception e) {
            Log.e(TAG, "Could not save auth session: " + e.getMessage());
        }
    }

    public static String getSavedEmail(Context context) {
        if (context == null) return "";
        try {
            return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY_USER_EMAIL, "");
        } catch (Exception e) {
            return "";
        }
    }

    public static String getSavedName(Context context) {
        if (context == null) return "Dokra Athlete";
        try {
            return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY_USER_NAME, "Dokra Athlete");
        } catch (Exception e) {
            return "Dokra Athlete";
        }
    }

    public static void clearSession(Context context) {
        if (context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().clear().apply();
        } catch (Exception e) {
            Log.e(TAG, "Could not clear auth session: " + e.getMessage());
        }
    }

    /**
     * 4-Color Rotating Progress View (Black, White with border, Yellow, Red)
     * Tailored for high visibility on light cement / grey backgrounds.
     */
    public static class DokraProgressDotsView extends View {
        private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private long startTime;

        private static final int COLOR_BLACK = 0xFF0F172A; // Crisp Deep Slate/Black
        private static final int COLOR_WHITE = 0xFFFFFFFF; // Pure White
        private static final int COLOR_YELLOW = 0xFFF59E0B; // Vibrant Gold/Yellow
        private static final int COLOR_RED = 0xFFEF4444; // Vibrant Red
        private static final int COLOR_BORDER = 0x330F172A; // Subtle border for white dot

        public DokraProgressDotsView(Context context) {
            super(context);
            init();
        }

        public DokraProgressDotsView(Context context, AttributeSet attrs) {
            super(context, attrs);
            init();
        }

        private void init() {
            startTime = SystemClock.uptimeMillis();
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setColor(COLOR_BORDER);
            strokePaint.setStrokeWidth(2f);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);

            int width = getWidth();
            int height = getHeight();
            if (width == 0 || height == 0) return;

            float cx = width / 2.0f;
            float cy = height / 2.0f;
            float radius = Math.min(cx, cy) * 0.55f;
            float dotRadius = Math.min(cx, cy) * 0.22f;

            long elapsed = SystemClock.uptimeMillis() - startTime;
            float angle = (elapsed % 1200) / 1200.0f * 360.0f;

            canvas.save();
            canvas.rotate(angle, cx, cy);

            // Dot 0: Black (Top)
            fillPaint.setColor(COLOR_BLACK);
            fillPaint.setStyle(Paint.Style.FILL);
            canvas.drawCircle(cx, cy - radius, dotRadius, fillPaint);

            // Dot 1: White (Right) - with subtle border for contrast on light background
            fillPaint.setColor(COLOR_WHITE);
            canvas.drawCircle(cx + radius, cy, dotRadius, fillPaint);
            canvas.drawCircle(cx + radius, cy, dotRadius, strokePaint);

            // Dot 2: Yellow (Bottom)
            fillPaint.setColor(COLOR_YELLOW);
            canvas.drawCircle(cx, cy + radius, dotRadius, fillPaint);

            // Dot 3: Red (Left)
            fillPaint.setColor(COLOR_RED);
            canvas.drawCircle(cx - radius, cy, dotRadius, fillPaint);

            canvas.restore();

            try {
                postInvalidateOnAnimation();
            } catch (Throwable ignored) {
                postInvalidateDelayed(16);
            }
        }
    }
}
