package com.shieldintelligence.authenticator;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "RootDetectionPlugin")
public class RootDetectionPlugin extends Plugin {

    @PluginMethod
    public void isRooted(PluginCall call) {
        List<String> reasons = new ArrayList<>();
        boolean rooted = detectRooted(reasons);

        JSObject result = new JSObject();
        result.put("rooted", rooted);

        JSArray reasonArray = new JSArray();
        for (String reason : reasons) {
            reasonArray.put(reason);
        }
        result.put("reasons", reasonArray);

        call.resolve(result);
    }

    private boolean detectRooted(List<String> reasons) {
        boolean rooted = false;

        if (hasTestKeys()) {
            rooted = true;
            reasons.add("build-tags-test-keys");
        }

        if (hasSuBinary()) {
            rooted = true;
            reasons.add("su-binary-present");
        }

        if (canExecuteSu()) {
            rooted = true;
            reasons.add("su-command-executable");
        }

        if (hasMagiskArtifacts()) {
            rooted = true;
            reasons.add("magisk-artifacts-present");
        }

        if (hasInsecureSystemProperties()) {
            rooted = true;
            reasons.add("insecure-system-properties");
        }

        return rooted;
    }

    private boolean hasTestKeys() {
        String tags = android.os.Build.TAGS;
        return tags != null && tags.contains("test-keys");
    }

    private boolean hasSuBinary() {
        String[] paths = new String[] {
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/system/bin/.ext/su",
            "/system/usr/we-need-root/su",
            "/system/usr/we-need-root/su-backup",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        };

        for (String path : paths) {
            if (new File(path).exists()) {
                return true;
            }
        }
        return false;
    }

    private boolean canExecuteSu() {
        return commandHasOutput(new String[] {"which", "su"})
            || commandHasOutput(new String[] {"/system/bin/which", "su"})
            || commandHasOutput(new String[] {"sh", "-c", "which su"});
    }

    private boolean hasMagiskArtifacts() {
        String[] paths = new String[] {
            "/sbin/.magisk",
            "/init.magisk.rc",
            "/dev/.magisk_unblock",
            "/cache/.disable_magisk",
            "/data/adb/magisk",
            "/data/adb/modules"
        };

        for (String path : paths) {
            if (new File(path).exists()) {
                return true;
            }
        }
        return false;
    }

    private boolean hasInsecureSystemProperties() {
        String debuggable = readSystemProperty("ro.debuggable");
        String secure = readSystemProperty("ro.secure");
        return "1".equals(debuggable) || "0".equals(secure);
    }

    private String readSystemProperty(String key) {
        Process process = null;
        BufferedReader reader = null;
        try {
            process = Runtime.getRuntime().exec(new String[] {"getprop", key});
            reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String value = reader.readLine();
            return value == null ? "" : value.trim();
        } catch (Exception ignored) {
            return "";
        } finally {
            try {
                if (reader != null) reader.close();
            } catch (Exception ignored) {
            }
            if (process != null) process.destroy();
        }
    }

    private boolean commandHasOutput(String[] command) {
        Process process = null;
        BufferedReader reader = null;
        try {
            process = Runtime.getRuntime().exec(command);
            reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = reader.readLine();
            return line != null && !line.trim().isEmpty();
        } catch (Exception ignored) {
            return false;
        } finally {
            try {
                if (reader != null) reader.close();
            } catch (Exception ignored) {
            }
            if (process != null) process.destroy();
        }
    }
}