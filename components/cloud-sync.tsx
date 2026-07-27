"use client";

import { useEffect } from "react";

import {
  ARCANUM_CLOUD_DATA_LOADED_EVENT,
  ARCANUM_DATA_CHANGED_EVENT,
  syncArcanumData,
} from "@/lib/cloud-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CloudSync() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let activeUserId: string | null = null;
    let timeoutId: number | null = null;
    let syncPromise: Promise<void> = Promise.resolve();

    function queueSync(mode: "initial" | "push") {
      if (!activeUserId || cancelled) return;
      const userId = activeUserId;
      syncPromise = syncPromise
        .catch(() => undefined)
        .then(async () => {
          if (cancelled || activeUserId !== userId) return;
          const { localChanged } = await syncArcanumData(supabase, userId, mode);
          if (localChanged && !cancelled) {
            window.dispatchEvent(new Event(ARCANUM_CLOUD_DATA_LOADED_EVENT));
          }
        })
        .catch((error) => {
          console.error("ARCANUM cloud sync failed", error);
        });
    }

    function schedulePush() {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => queueSync("push"), 500);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      activeUserId = data.user?.id ?? null;
      if (activeUserId) queueSync("initial");
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        const nextUserId = session?.user.id ?? null;
        if (nextUserId === activeUserId) return;
        activeUserId = nextUserId;
        if (activeUserId) queueSync("initial");
      },
    );

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") queueSync("initial");
    }

    window.addEventListener(ARCANUM_DATA_CHANGED_EVENT, schedulePush);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      authSubscription.subscription.unsubscribe();
      window.removeEventListener(ARCANUM_DATA_CHANGED_EVENT, schedulePush);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
