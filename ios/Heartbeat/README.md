# Heartbeat

A tiny iPhone app + Home Screen widget that charts your Apple Watch heart rate
over the last 12 hours, Cardiogram-style: 10-minute bars (orange when elevated,
blue when resting), dashed gridlines at 60/80/100 and your latest reading in the
corner.

## Build it (needs a Mac with Xcode 15+)

1. `brew install xcodegen`
2. In this folder: `xcodegen` → creates `Heartbeat.xcodeproj`
3. Open it, select the **Heartbeat** target › Signing & Capabilities, and pick your
   team (do the same for **HeartbeatWidget**). If the bundle IDs or the app group
   `group.com.aaronmoradi.heartbeat` are taken, change them in `project.yml` and in
   `HeartRateService.appGroup`, then re-run `xcodegen`.
4. Plug in your iPhone, choose it as the run destination and hit Run.
5. Allow Heart Rate access when asked, then long-press the Home Screen › Edit ›
   Add Widget › Heartbeat.

## How the data flows

- The widget queries HealthKit directly every ~15 minutes.
- iOS encrypts Health data while the phone is locked, so the app also registers a
  HealthKit background observer: when your Watch syncs, the app caches the latest
  12 hours in a shared app group and reloads the widget. The widget falls back to
  that cache whenever it can't read HealthKit itself.

## Tweaks

- Window / bar width: `HeartRateService.window` and `.bucket` in `Shared/HeartRateData.swift`
- Orange-vs-blue cutoff and colours: `HeartbeatStyle` in `Shared/HeartRateChartView.swift`
