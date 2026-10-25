import SwiftUI
import WidgetKit

struct HeartRateEntry: TimelineEntry {
    let date: Date
    let snapshot: HeartRateSnapshot
}

struct HeartRateProvider: TimelineProvider {
    func placeholder(in context: Context) -> HeartRateEntry {
        HeartRateEntry(date: .now, snapshot: .sample())
    }

    func getSnapshot(in context: Context, completion: @escaping (HeartRateEntry) -> Void) {
        if context.isPreview {
            completion(placeholder(in: context))
            return
        }
        Task {
            let snapshot = await HeartRateService.fetchOrCached() ?? .sample()
            completion(HeartRateEntry(date: .now, snapshot: snapshot))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HeartRateEntry>) -> Void) {
        Task {
            let now = Date.now
            let snapshot = await HeartRateService.fetchOrCached(now: now) ?? .empty(now: now)
            // WidgetKit budgets refreshes; ~15 minutes is about as often as it allows.
            let next = now.addingTimeInterval(15 * 60)
            completion(Timeline(entries: [HeartRateEntry(date: now, snapshot: snapshot)], policy: .after(next)))
        }
    }
}

struct HeartbeatWidgetView: View {
    var entry: HeartRateEntry

    var body: some View {
        HeartRateChartView(snapshot: entry.snapshot)
            .containerBackground(HeartbeatStyle.background, for: .widget)
    }
}

@main
struct HeartbeatWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "HeartbeatWidget", provider: HeartRateProvider()) { entry in
            HeartbeatWidgetView(entry: entry)
        }
        .configurationDisplayName("Heart Rate")
        .description("Your Apple Watch heart rate over the last 12 hours.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

#Preview(as: .systemMedium) {
    HeartbeatWidget()
} timeline: {
    HeartRateEntry(date: .now, snapshot: .sample())
}
