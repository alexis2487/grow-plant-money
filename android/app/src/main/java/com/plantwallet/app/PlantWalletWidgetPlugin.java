package com.plantwallet.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PlantWalletWidget")
public class PlantWalletWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences p = WidgetHelper.getPrefs(context);
            SharedPreferences.Editor editor = p.edit();

            if (call.hasOption("score")) {
                editor.putInt("score", call.getInt("score", 90));
            }
            if (call.hasOption("balance")) {
                editor.putString("balance", call.getString("balance", "$0"));
            }
            if (call.hasOption("income")) {
                editor.putString("income", call.getString("income", "+$0"));
            }
            if (call.hasOption("expense")) {
                editor.putString("expense", call.getString("expense", "-$0"));
            }
            if (call.hasOption("savings")) {
                editor.putString("savings", call.getString("savings", "$0"));
            }
            if (call.hasOption("goalTitle")) {
                editor.putString("goalTitle", call.getString("goalTitle", "Meta de ahorro"));
            }
            if (call.hasOption("goalAmount")) {
                editor.putString("goalAmount", call.getString("goalAmount", "$0 / $0"));
            }
            if (call.hasOption("goalPercent")) {
                editor.putInt("goalPercent", call.getInt("goalPercent", 0));
            }
            if (call.hasOption("goalCompleted")) {
                editor.putBoolean("goalCompleted", call.getBoolean("goalCompleted", false));
            }

            // Toggles
            if (call.hasOption("privacyMode")) {
                editor.putBoolean("privacyMode", call.getBoolean("privacyMode", false));
            }
            if (call.hasOption("showBalance")) {
                editor.putBoolean("showBalance", call.getBoolean("showBalance", true));
            }
            if (call.hasOption("showIncome")) {
                editor.putBoolean("showIncome", call.getBoolean("showIncome", true));
            }
            if (call.hasOption("showExpenses")) {
                editor.putBoolean("showExpenses", call.getBoolean("showExpenses", true));
            }
            if (call.hasOption("showScore")) {
                editor.putBoolean("showScore", call.getBoolean("showScore", true));
            }
            if (call.hasOption("showGoals")) {
                editor.putBoolean("showGoals", call.getBoolean("showGoals", true));
            }

            editor.apply();

            WidgetHelper.updateAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget data: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void pinWidget(PluginCall call) {
        try {
            Context context = getContext();
            String widgetType = call.getString("widgetType", "compact");
            Class<?> targetProvider;

            if ("summary".equalsIgnoreCase(widgetType)) {
                targetProvider = SummaryWidgetProvider.class;
            } else if ("goals".equalsIgnoreCase(widgetType)) {
                targetProvider = GoalsWidgetProvider.class;
            } else {
                targetProvider = CompactWidgetProvider.class;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                if (appWidgetManager.isRequestPinAppWidgetSupported()) {
                    ComponentName provider = new ComponentName(context, targetProvider);
                    boolean requested = appWidgetManager.requestPinAppWidget(provider, null, null);
                    JSObject ret = new JSObject();
                    ret.put("supported", true);
                    ret.put("requested", requested);
                    call.resolve(ret);
                    return;
                }
            }

            JSObject ret = new JSObject();
            ret.put("supported", false);
            ret.put("message", "El launcher no soporta anclado directo. Agrégalo manteniendo presionada la pantalla de inicio.");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error requesting pin widget: " + e.getMessage(), e);
        }
    }
}
