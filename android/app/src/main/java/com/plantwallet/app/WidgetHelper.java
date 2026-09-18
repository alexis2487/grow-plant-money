package com.plantwallet.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

public class WidgetHelper {

    public static final String PREFS_NAME = "PlantWalletWidgets";

    public static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static String getPlantEmoji(int score) {
        if (score <= 20) {
            return "🌱"; // 0-20: Brote / estado crítico
        } else if (score <= 40) {
            return "🥀"; // 21-40: Planta marchita / riesgo
        } else if (score <= 60) {
            return "🌿"; // 41-60: Planta en crecimiento / atención
        } else if (score <= 80) {
            return "🪴"; // 61-80: Planta saludable
        } else {
            return "🌸"; // 81-100: Planta floreciendo / excelente
        }
    }

    private static PendingIntent createPendingIntent(Context context, String route, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("https://plantwallet.app" + route));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags);
    }

    public static RemoteViews buildCompactViews(Context context) {
        SharedPreferences p = getPrefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_compact_2x2);

        int score = p.getInt("score", 90);
        boolean hasScore = p.getBoolean("showScore", true);
        boolean showBalance = p.getBoolean("showBalance", true);
        boolean privacyMode = p.getBoolean("privacyMode", false);
        String balance = p.getString("balance", "$0");
        String plantEmoji = getPlantEmoji(score);

        views.setTextViewText(R.id.tv_plant_emoji, plantEmoji);
        views.setTextViewText(R.id.tv_health, "Salud: " + score + "/100");
        views.setViewVisibility(R.id.tv_health, hasScore ? View.VISIBLE : View.GONE);

        if (privacyMode) {
            views.setTextViewText(R.id.tv_balance, "••••••••");
        } else {
            views.setTextViewText(R.id.tv_balance, balance);
        }
        views.setViewVisibility(R.id.ll_balance_container, showBalance ? View.VISIBLE : View.GONE);

        // Clicks
        views.setOnClickPendingIntent(R.id.widget_compact_root, createPendingIntent(context, "/inicio", 1001));
        views.setOnClickPendingIntent(R.id.btn_quick_add, createPendingIntent(context, "/inicio?quick=expense", 1002));

        return views;
    }

    public static RemoteViews buildSummaryViews(Context context) {
        SharedPreferences p = getPrefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_summary_4x2);

        int score = p.getInt("score", 90);
        boolean hasScore = p.getBoolean("showScore", true);
        boolean showBalance = p.getBoolean("showBalance", true);
        boolean showIncome = p.getBoolean("showIncome", true);
        boolean showExpenses = p.getBoolean("showExpenses", true);
        boolean privacyMode = p.getBoolean("privacyMode", false);

        String balance = p.getString("balance", "$0");
        String income = p.getString("income", "+$0");
        String expense = p.getString("expense", "-$0");
        String plantEmoji = getPlantEmoji(score);

        views.setTextViewText(R.id.tv_plant_emoji, plantEmoji);
        views.setTextViewText(R.id.tv_health, score + "/100");
        views.setViewVisibility(R.id.tv_health, hasScore ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.tv_health_label, hasScore ? View.VISIBLE : View.GONE);

        if (privacyMode) {
            views.setTextViewText(R.id.tv_balance, "••••••••");
            views.setTextViewText(R.id.tv_income, "Ingresos: ••••••••");
            views.setTextViewText(R.id.tv_expense, "Gastos: ••••••••");
        } else {
            views.setTextViewText(R.id.tv_balance, balance);
            views.setTextViewText(R.id.tv_income, "Ingresos: " + income);
            views.setTextViewText(R.id.tv_expense, "Gastos: " + expense);
        }

        views.setViewVisibility(R.id.ll_balance_trigger, showBalance ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.tv_income, showIncome ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.tv_expense, showExpenses ? View.VISIBLE : View.GONE);

        // Clicks
        views.setOnClickPendingIntent(R.id.ll_dashboard_trigger, createPendingIntent(context, "/inicio", 2001));
        views.setOnClickPendingIntent(R.id.ll_balance_trigger, createPendingIntent(context, "/movimientos", 2002));
        views.setOnClickPendingIntent(R.id.btn_quick_expense, createPendingIntent(context, "/inicio?quick=expense", 2003));
        views.setOnClickPendingIntent(R.id.btn_quick_income, createPendingIntent(context, "/inicio?quick=income", 2004));

        return views;
    }

    public static RemoteViews buildGoalsViews(Context context) {
        SharedPreferences p = getPrefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_goals_4x4);

        int score = p.getInt("score", 90);
        boolean hasScore = p.getBoolean("showScore", true);
        boolean showBalance = p.getBoolean("showBalance", true);
        boolean showGoals = p.getBoolean("showGoals", true);
        boolean privacyMode = p.getBoolean("privacyMode", false);

        String balance = p.getString("balance", "$0");
        String savings = p.getString("savings", "$0");
        String goalTitle = p.getString("goalTitle", "Meta de ahorro");
        String goalAmount = p.getString("goalAmount", "$0 / $0");
        int goalPercent = p.getInt("goalPercent", 0);
        boolean goalCompleted = p.getBoolean("goalCompleted", false);
        String plantEmoji = goalCompleted ? "🌸" : getPlantEmoji(score);

        views.setTextViewText(R.id.tv_plant_emoji, plantEmoji);
        views.setTextViewText(R.id.tv_health, score + "/100");
        views.setViewVisibility(R.id.tv_health, hasScore ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.tv_health_label, hasScore ? View.VISIBLE : View.GONE);

        if (privacyMode) {
            views.setTextViewText(R.id.tv_balance, "••••••••");
            views.setTextViewText(R.id.tv_savings, "••••••••");
        } else {
            views.setTextViewText(R.id.tv_balance, balance);
            views.setTextViewText(R.id.tv_savings, savings);
        }

        views.setViewVisibility(R.id.ll_balance_trigger, showBalance ? View.VISIBLE : View.GONE);

        if (showGoals) {
            views.setViewVisibility(R.id.ll_goal_card, View.VISIBLE);
            views.setTextViewText(R.id.tv_goal_title, goalTitle);
            views.setTextViewText(R.id.tv_goal_amount, privacyMode ? "••••••••" : goalAmount);
            views.setTextViewText(R.id.tv_goal_percent, goalPercent + "%");
            views.setProgressBar(R.id.pb_goal_progress, 100, Math.min(100, Math.max(0, goalPercent)), false);

            if (goalCompleted) {
                views.setViewVisibility(R.id.tv_goal_completed_msg, View.VISIBLE);
                views.setTextViewText(R.id.tv_goal_completed_msg, "🌸 ¡Meta completada! Tu planta floreció.");
            } else {
                views.setViewVisibility(R.id.tv_goal_completed_msg, View.GONE);
            }
        } else {
            views.setViewVisibility(R.id.ll_goal_card, View.GONE);
        }

        // Clicks
        views.setOnClickPendingIntent(R.id.ll_dashboard_trigger, createPendingIntent(context, "/inicio", 3001));
        views.setOnClickPendingIntent(R.id.ll_balance_trigger, createPendingIntent(context, "/movimientos", 3002));
        views.setOnClickPendingIntent(R.id.btn_quick_expense, createPendingIntent(context, "/inicio?quick=expense", 3003));
        views.setOnClickPendingIntent(R.id.btn_quick_income, createPendingIntent(context, "/inicio?quick=income", 3004));
        views.setOnClickPendingIntent(R.id.btn_view_goals, createPendingIntent(context, "/retos", 3005));
        views.setOnClickPendingIntent(R.id.ll_goal_card, createPendingIntent(context, "/retos", 3006));

        return views;
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);

        // 1. Compact 2x2
        ComponentName compactName = new ComponentName(context, CompactWidgetProvider.class);
        int[] compactIds = manager.getAppWidgetIds(compactName);
        if (compactIds != null && compactIds.length > 0) {
            RemoteViews views = buildCompactViews(context);
            for (int id : compactIds) {
                manager.updateAppWidget(id, views);
            }
        }

        // 2. Summary 4x2
        ComponentName summaryName = new ComponentName(context, SummaryWidgetProvider.class);
        int[] summaryIds = manager.getAppWidgetIds(summaryName);
        if (summaryIds != null && summaryIds.length > 0) {
            RemoteViews views = buildSummaryViews(context);
            for (int id : summaryIds) {
                manager.updateAppWidget(id, views);
            }
        }

        // 3. Goals 4x4
        ComponentName goalsName = new ComponentName(context, GoalsWidgetProvider.class);
        int[] goalsIds = manager.getAppWidgetIds(goalsName);
        if (goalsIds != null && goalsIds.length > 0) {
            RemoteViews views = buildGoalsViews(context);
            for (int id : goalsIds) {
                manager.updateAppWidget(id, views);
            }
        }
    }
}
