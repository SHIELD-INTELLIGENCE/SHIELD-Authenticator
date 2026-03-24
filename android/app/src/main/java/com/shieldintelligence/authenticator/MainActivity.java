package com.shieldintelligence.authenticator;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void enforceNonOverlaySystemBars(Window window) {
        // Keep web content below system bars instead of drawing edge-to-edge.
        WindowCompat.setDecorFitsSystemWindows(window, true);

        // Ensure fullscreen window flags are disabled.
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);

        // Clear fullscreen/layout flags that can force content under status bar.
        View decor = window.getDecorView();
        int flags = decor.getSystemUiVisibility();
        flags &= ~View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
        flags &= ~View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
        flags &= ~View.SYSTEM_UI_FLAG_FULLSCREEN;
        decor.setSystemUiVisibility(flags);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScreenSecurityPlugin.class);
        registerPlugin(RootDetectionPlugin.class);
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        enforceNonOverlaySystemBars(window);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Set SHIELD Gold as status bar
            window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorAccent));

            // Set SHIELD Gold as navigation bar
            window.setNavigationBarColor(ContextCompat.getColor(this, R.color.shield_gold));

            // Force dark icons for visibility
            View decor = window.getDecorView();
            int flags = decor.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decor.setSystemUiVisibility(flags);

            // MIUI-specific fix (optional, doesn’t break other phones)
            setMIUIStatusBarDarkMode(window, true);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        enforceNonOverlaySystemBars(getWindow());
    }

    private void setMIUIStatusBarDarkMode(Window window, boolean dark) {
        try {
            Class<?> clazz = window.getClass();
            int darkModeFlag;
            Class<?> layoutParams = Class.forName("android.view.MiuiWindowManager$LayoutParams");
            java.lang.reflect.Field field = layoutParams.getField("EXTRA_FLAG_STATUS_BAR_DARK_MODE");
            darkModeFlag = field.getInt(layoutParams);
            java.lang.reflect.Method extraFlagField = clazz.getMethod("setExtraFlags", int.class, int.class);
            extraFlagField.invoke(window, dark ? darkModeFlag : 0, darkModeFlag);
        } catch (Exception ignored) {}
    }
}
