import HealthKit
import SwiftUI
import WidgetKit

@main
struct HeartbeatApp: App {
    init() {
        // HealthKit wakes the app in the background when the Watch syncs new
        // heart rate samples. The observer must be registered at every launch.
        BackgroundRefresher.start()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

enum BackgroundRefresher {
    static func start() {
        guard HeartRateService.isAvailable else { return }
        let store = HeartRateService.store
        let type = HeartRateService.heartRateType

        let query = HKObserverQuery(sampleType: type, predicate: nil) { _, completion, error in
            guard error == nil else { completion(); return }
            Task {
                // Cache the fresh data while the phone is unlocked, then nudge the widget.
                _ = await HeartRateService.fetchOrCached()
                WidgetCenter.shared.reloadAllTimelines()
                completion()
            }
        }
        store.execute(query)
        store.enableBackgroundDelivery(for: type, frequency: .immediate) { _, _ in }
    }
}
