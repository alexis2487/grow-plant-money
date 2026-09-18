package com.plantwallet.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PlantWalletWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
