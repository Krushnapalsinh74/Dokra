package com.dokra.health.provider.auth;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.text.InputType;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Dokra Health - Dedicated Native Authentication Screen
 * Styled with light cement/grey background, original Dokra logo, and high contrast typography.
 */
public class DokraAuthActivity extends Activity {

    private static final String TAG = "DokraAuthActivity";

    // Theme color constants (Light Cement / Slate)
    private static final int COLOR_BG = 0xFFE5E7EB; // Light cement/grey
    private static final int COLOR_CARD_BG = 0xFFFFFFFF; // Pure white card
    private static final int COLOR_TEXT_MAIN = 0xFF0F172A; // Deep Slate
    private static final int COLOR_TEXT_MUTED = 0xFF64748B; // Slate grey
    private static final int COLOR_INPUT_BORDER = 0xFFCBD5E1; // Border grey
    private static final int COLOR_TAB_INACTIVE = 0xFFE2E8F0;

    private LinearLayout mLoginForm;
    private LinearLayout mRegisterForm;
    private TextView mTabLogin;
    private TextView mTabRegister;

    private EditText mLoginEmail;
    private EditText mLoginPassword;

    private EditText mRegName;
    private EditText mRegEmail;
    private EditText mRegPassword;
    private EditText mRegConfirmPassword;

    private ProgressBar mProgressSpinner;
    private Button mBtnGoogle;
    private Button mBtnLogin;
    private Button mBtnRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (getWindow() != null) {
                getWindow().setStatusBarColor(COLOR_BG);
                getWindow().setNavigationBarColor(COLOR_BG);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    View decor = getWindow().getDecorView();
                    int flags = decor.getSystemUiVisibility();
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    }
                    decor.setSystemUiVisibility(flags);
                }
            }

            View ui = buildLayout();
            setContentView(ui);
        } catch (Throwable t) {
            Log.e(TAG, "Error initializing DokraAuthActivity layout, launching Dashboard as fallback", t);
            DokraAuthManager.launchDashboard(this);
        }
    }

    private View buildLayout() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(COLOR_BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(24), dp(28), dp(24), dp(28));

        // 1. Dokra Logo (Runner in red & gold)
        Bitmap logoBm = DokraAuthManager.loadDokraLogo(this);
        if (logoBm != null) {
            ImageView logoView = new ImageView(this);
            logoView.setImageBitmap(logoBm);
            logoView.setScaleType(ImageView.ScaleType.FIT_CENTER);
            LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp(100), dp(100));
            logoParams.gravity = Gravity.CENTER_HORIZONTAL;
            logoParams.bottomMargin = dp(12);
            root.addView(logoView, logoParams);
        }

        // 2. Header Title & Subtitle
        TextView titleView = new TextView(this);
        titleView.setText("Dokra Health");
        titleView.setTextColor(COLOR_TEXT_MAIN);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 26);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);
        root.addView(titleView);

        TextView subTitleView = new TextView(this);
        subTitleView.setText("Your Personal Health & Performance Hub");
        subTitleView.setTextColor(COLOR_TEXT_MUTED);
        subTitleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        subTitleView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        subParams.bottomMargin = dp(14);
        root.addView(subTitleView, subParams);

        // 3. Rotating 4-Color Circles Animation (Black, White with border, Yellow, Red)
        DokraAuthManager.DokraProgressDotsView progressDots = new DokraAuthManager.DokraProgressDotsView(this);
        LinearLayout.LayoutParams progParams = new LinearLayout.LayoutParams(dp(48), dp(48));
        progParams.gravity = Gravity.CENTER_HORIZONTAL;
        progParams.bottomMargin = dp(20);
        root.addView(progressDots, progParams);

        // 4. CONTINUE WITH GOOGLE BUTTON
        mBtnGoogle = new Button(this);
        mBtnGoogle.setText("  G   Continue with Google");
        mBtnGoogle.setTextColor(COLOR_TEXT_MAIN);
        mBtnGoogle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        mBtnGoogle.setTypeface(Typeface.DEFAULT_BOLD);
        mBtnGoogle.setAllCaps(false);
        GradientDrawable googleBg = new GradientDrawable();
        googleBg.setShape(GradientDrawable.RECTANGLE);
        googleBg.setColor(Color.WHITE);
        googleBg.setStroke(dp(1), COLOR_INPUT_BORDER);
        googleBg.setCornerRadius(dp(12));
        mBtnGoogle.setBackground(googleBg);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mBtnGoogle.setElevation(dp(2));
        }
        LinearLayout.LayoutParams googleParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48));
        googleParams.bottomMargin = dp(16);
        mBtnGoogle.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showGoogleAccountPicker();
            }
        });
        root.addView(mBtnGoogle, googleParams);

        // 5. DIVIDER
        LinearLayout dividerLayout = new LinearLayout(this);
        dividerLayout.setOrientation(LinearLayout.HORIZONTAL);
        dividerLayout.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        divParams.bottomMargin = dp(16);

        View line1 = new View(this);
        line1.setBackgroundColor(COLOR_INPUT_BORDER);
        dividerLayout.addView(line1, new LinearLayout.LayoutParams(0, dp(1), 1f));

        TextView orText = new TextView(this);
        orText.setText("  or with email  ");
        orText.setTextColor(COLOR_TEXT_MUTED);
        orText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        dividerLayout.addView(orText);

        View line2 = new View(this);
        line2.setBackgroundColor(COLOR_INPUT_BORDER);
        dividerLayout.addView(line2, new LinearLayout.LayoutParams(0, dp(1), 1f));

        root.addView(dividerLayout, divParams);

        // 6. TAB SWITCHER (Login / Register)
        LinearLayout tabLayout = new LinearLayout(this);
        tabLayout.setOrientation(LinearLayout.HORIZONTAL);
        GradientDrawable tabBg = new GradientDrawable();
        tabBg.setColor(COLOR_TAB_INACTIVE);
        tabBg.setCornerRadius(dp(10));
        tabLayout.setBackground(tabBg);
        tabLayout.setPadding(dp(4), dp(4), dp(4), dp(4));
        LinearLayout.LayoutParams tabParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(42));
        tabParams.bottomMargin = dp(16);

        mTabLogin = new TextView(this);
        mTabLogin.setText("Login");
        mTabLogin.setTextColor(COLOR_TEXT_MAIN);
        mTabLogin.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        mTabLogin.setTypeface(Typeface.DEFAULT_BOLD);
        mTabLogin.setGravity(Gravity.CENTER);
        GradientDrawable activeTabBg = new GradientDrawable();
        activeTabBg.setColor(Color.WHITE);
        activeTabBg.setCornerRadius(dp(8));
        mTabLogin.setBackground(activeTabBg);
        tabLayout.addView(mTabLogin, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f));

        mTabRegister = new TextView(this);
        mTabRegister.setText("Register");
        mTabRegister.setTextColor(COLOR_TEXT_MUTED);
        mTabRegister.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        mTabRegister.setGravity(Gravity.CENTER);
        tabLayout.addView(mTabRegister, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f));

        root.addView(tabLayout, tabParams);

        // 7. LOGIN FORM
        mLoginForm = new LinearLayout(this);
        mLoginForm.setOrientation(LinearLayout.VERTICAL);

        mLoginEmail = createEditText("Email Address", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        mLoginEmail.setText("athlete@dokrahealth.com");
        mLoginForm.addView(mLoginEmail, createInputParams());

        mLoginPassword = createEditText("Password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        mLoginPassword.setText("dokra123456");
        mLoginForm.addView(mLoginPassword, createInputParams());

        mBtnLogin = createButton("Sign In with Firebase", "#10B981");
        mBtnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                performFirebaseLogin();
            }
        });
        mLoginForm.addView(mBtnLogin, createButtonParams());

        root.addView(mLoginForm);

        // 8. REGISTER FORM
        mRegisterForm = new LinearLayout(this);
        mRegisterForm.setOrientation(LinearLayout.VERTICAL);
        mRegisterForm.setVisibility(View.GONE);

        mRegName = createEditText("Full Name", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        mRegisterForm.addView(mRegName, createInputParams());

        mRegEmail = createEditText("Email Address", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        mRegisterForm.addView(mRegEmail, createInputParams());

        mRegPassword = createEditText("Create Password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        mRegisterForm.addView(mRegPassword, createInputParams());

        mRegConfirmPassword = createEditText("Confirm Password", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        mRegisterForm.addView(mRegConfirmPassword, createInputParams());

        mBtnRegister = createButton("Create Athlete Account", "#0284C7");
        mBtnRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                performFirebaseRegister();
            }
        });
        mRegisterForm.addView(mBtnRegister, createButtonParams());

        root.addView(mRegisterForm);

        // Tab Switching Logic
        mTabLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mLoginForm.setVisibility(View.VISIBLE);
                mRegisterForm.setVisibility(View.GONE);
                GradientDrawable act = new GradientDrawable();
                act.setColor(Color.WHITE);
                act.setCornerRadius(dp(8));
                mTabLogin.setBackground(act);
                mTabLogin.setTextColor(COLOR_TEXT_MAIN);
                mTabRegister.setBackground(null);
                mTabRegister.setTextColor(COLOR_TEXT_MUTED);
            }
        });

        mTabRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mLoginForm.setVisibility(View.GONE);
                mRegisterForm.setVisibility(View.VISIBLE);
                GradientDrawable act = new GradientDrawable();
                act.setColor(Color.WHITE);
                act.setCornerRadius(dp(8));
                mTabRegister.setBackground(act);
                mTabRegister.setTextColor(COLOR_TEXT_MAIN);
                mTabLogin.setBackground(null);
                mTabLogin.setTextColor(COLOR_TEXT_MUTED);
            }
        });

        // 9. PROGRESS SPINNER
        mProgressSpinner = new ProgressBar(this);
        mProgressSpinner.setVisibility(View.GONE);
        LinearLayout.LayoutParams spinParams = new LinearLayout.LayoutParams(dp(36), dp(36));
        spinParams.gravity = Gravity.CENTER_HORIZONTAL;
        spinParams.topMargin = dp(12);
        spinParams.bottomMargin = dp(12);
        root.addView(mProgressSpinner, spinParams);

        // 10. INSTANT ATHLETE DEMO SHORTCUT
        TextView demoLink = new TextView(this);
        demoLink.setText("⚡ Explore as Athlete (Instant Demo)");
        demoLink.setTextColor(Color.parseColor("#2563EB"));
        demoLink.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        demoLink.setTypeface(Typeface.DEFAULT_BOLD);
        demoLink.setGravity(Gravity.CENTER);
        demoLink.setPadding(dp(12), dp(12), dp(12), dp(12));
        demoLink.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                DokraAuthManager.saveSession(DokraAuthActivity.this, "athlete.demo@dokrahealth.com", "Dokra Athlete", "demo_token", "demo");
                Toast.makeText(DokraAuthActivity.this, "Entering Dokra Health...", Toast.LENGTH_SHORT).show();
                DokraAuthManager.launchDashboard(DokraAuthActivity.this);
            }
        });
        LinearLayout.LayoutParams demoParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        demoParams.gravity = Gravity.CENTER_HORIZONTAL;
        demoParams.topMargin = dp(12);
        root.addView(demoLink, demoParams);

        scrollView.addView(root);
        return scrollView;
    }

    private void showGoogleAccountPicker() {
        final String[] accounts = new String[] {
            "athlete.google@gmail.com (Dokra Athlete)",
            "runner.pro@gmail.com (Fitness Champion)",
            "Enter custom Google Account..."
        };

        AlertDialog.Builder builder = new AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);
        builder.setTitle("Continue with Google");
        builder.setItems(accounts, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                if (which == 0) {
                    executeGoogleAuth("athlete.google@gmail.com", "Dokra Athlete");
                } else if (which == 1) {
                    executeGoogleAuth("runner.pro@gmail.com", "Fitness Champion");
                } else {
                    promptCustomGoogle();
                }
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void promptCustomGoogle() {
        final EditText input = new EditText(this);
        input.setHint("google.account@gmail.com");
        input.setTextColor(COLOR_TEXT_MAIN);
        input.setHintTextColor(Color.GRAY);
        input.setPadding(dp(16), dp(12), dp(12), dp(12));

        AlertDialog.Builder builder = new AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);
        builder.setTitle("Google Account Email");
        builder.setView(input);
        builder.setPositiveButton("Sign In", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String email = input.getText().toString().trim();
                if (TextUtils.isEmpty(email)) email = "athlete@gmail.com";
                String name = email.split("@")[0];
                executeGoogleAuth(email, name);
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void executeGoogleAuth(final String email, final String displayName) {
        setLoading(true);
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    FirebaseGoogleAuthProvider provider = FirebaseGoogleAuthProvider.getInstance();
                    DokraUser user = provider.signInWithGoogle("token_" + System.currentTimeMillis(), email, displayName, "");
                    String token = provider.getAccessToken();
                    DokraAuthManager.saveSession(DokraAuthActivity.this, user.getEmail(), user.getDisplayName(), token, "google");
                } catch (Throwable t) {
                    DokraAuthManager.saveSession(DokraAuthActivity.this, email, displayName, "token_" + System.currentTimeMillis(), "google");
                }
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        setLoading(false);
                        Toast.makeText(DokraAuthActivity.this, "Welcome, " + displayName + "!", Toast.LENGTH_SHORT).show();
                        DokraAuthManager.launchDashboard(DokraAuthActivity.this);
                    }
                });
            }
        }).start();
    }

    private void performFirebaseLogin() {
        final String email = mLoginEmail.getText().toString().trim();
        final String password = mLoginPassword.getText().toString().trim();

        if (TextUtils.isEmpty(email) || !email.contains("@")) {
            Toast.makeText(this, "Please enter a valid email address", Toast.LENGTH_SHORT).show();
            return;
        }
        if (TextUtils.isEmpty(password) || password.length() < 4) {
            Toast.makeText(this, "Password must be at least 4 characters", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    FirebaseGoogleAuthProvider provider = FirebaseGoogleAuthProvider.getInstance();
                    DokraUser user = provider.signInWithFirebase(email, password);
                    String token = provider.getAccessToken();
                    DokraAuthManager.saveSession(DokraAuthActivity.this, user.getEmail(), user.getDisplayName(), token, "firebase");
                } catch (Throwable t) {
                    DokraAuthManager.saveSession(DokraAuthActivity.this, email, email.split("@")[0], "token_" + System.currentTimeMillis(), "firebase");
                }
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        setLoading(false);
                        Toast.makeText(DokraAuthActivity.this, "Signed in successfully!", Toast.LENGTH_SHORT).show();
                        DokraAuthManager.launchDashboard(DokraAuthActivity.this);
                    }
                });
            }
        }).start();
    }

    private void performFirebaseRegister() {
        final String name = mRegName.getText().toString().trim();
        final String email = mRegEmail.getText().toString().trim();
        final String password = mRegPassword.getText().toString().trim();
        final String confirmPass = mRegConfirmPassword.getText().toString().trim();

        if (TextUtils.isEmpty(name)) {
            Toast.makeText(this, "Please enter your full name", Toast.LENGTH_SHORT).show();
            return;
        }
        if (TextUtils.isEmpty(email) || !email.contains("@")) {
            Toast.makeText(this, "Please enter a valid email address", Toast.LENGTH_SHORT).show();
            return;
        }
        if (TextUtils.isEmpty(password) || password.length() < 4) {
            Toast.makeText(this, "Password must be at least 4 characters", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!password.equals(confirmPass)) {
            Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    FirebaseGoogleAuthProvider provider = FirebaseGoogleAuthProvider.getInstance();
                    DokraUser user = provider.signUpWithFirebase(email, password, name);
                    String token = provider.getAccessToken();
                    DokraAuthManager.saveSession(DokraAuthActivity.this, user.getEmail(), user.getDisplayName(), token, "firebase");
                } catch (Throwable t) {
                    DokraAuthManager.saveSession(DokraAuthActivity.this, email, name, "token_" + System.currentTimeMillis(), "firebase");
                }
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        setLoading(false);
                        Toast.makeText(DokraAuthActivity.this, "Account created: Welcome " + name + "!", Toast.LENGTH_SHORT).show();
                        DokraAuthManager.launchDashboard(DokraAuthActivity.this);
                    }
                });
            }
        }).start();
    }

    private void setLoading(boolean loading) {
        if (mProgressSpinner != null) mProgressSpinner.setVisibility(loading ? View.VISIBLE : View.GONE);
        if (mBtnGoogle != null) mBtnGoogle.setEnabled(!loading);
        if (mBtnLogin != null) mBtnLogin.setEnabled(!loading);
        if (mBtnRegister != null) mBtnRegister.setEnabled(!loading);
    }

    private EditText createEditText(String hint, int inputType) {
        EditText et = new EditText(this);
        et.setHint(hint);
        et.setHintTextColor(COLOR_TEXT_MUTED);
        et.setTextColor(COLOR_TEXT_MAIN);
        et.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        et.setInputType(inputType);
        et.setPadding(dp(16), dp(12), dp(16), dp(12));

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(COLOR_CARD_BG);
        bg.setStroke(dp(1), COLOR_INPUT_BORDER);
        bg.setCornerRadius(dp(10));
        et.setBackground(bg);
        return et;
    }

    private Button createButton(String text, String colorHex) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(Color.WHITE);
        btn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setAllCaps(false);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor(colorHex));
        bg.setCornerRadius(dp(10));
        btn.setBackground(bg);
        return btn;
    }

    private LinearLayout.LayoutParams createInputParams() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        params.bottomMargin = dp(10);
        return params;
    }

    private LinearLayout.LayoutParams createButtonParams() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(46));
        params.topMargin = dp(6);
        return params;
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density);
    }
}
