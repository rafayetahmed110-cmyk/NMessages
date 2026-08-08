package com.nmessages.app

import android.app.Service
import android.content.Intent
import android.os.IBinder

class HeadlessSmsSendService : Service() {
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Headless service for RESPOND_VIA_MESSAGE intent filter required by Default SMS role
        return START_NOT_STICKY
    }
}
