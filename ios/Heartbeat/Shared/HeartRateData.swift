import Foundation
import HealthKit

/// One bar on the chart: the average heart rate over a short slice of time.
struct HeartRateBucket: Codable, Hashable, Identifiable {
    let start: Date
    let end: Date
    let bpm: Double
    var id: Date { start }
}

/// Everything the chart needs to draw itself.
struct HeartRateSnapshot: Codable {
    let windowStart: Date
    let windowEnd: Date
    let buckets: [HeartRateBucket]
    let latestBPM: Int?
    let latestDate: Date?

    var isEmpty: Bool { buckets.isEmpty }

    static func empty(now: Date = .now) -> HeartRateSnapshot {
        HeartRateSnapshot(windowStart: now.addingTimeInterval(-HeartRateService.window),
                          windowEnd: now, buckets: [], latestBPM: nil, latestDate: nil)
    }

    /// Plausible-looking fake data for widget previews and the gallery.
    static func sample(now: Date = .now) -> HeartRateSnapshot {
        let start = now.addingTimeInterval(-HeartRateService.window)
        let step = HeartRateService.bucket
        var buckets: [HeartRateBucket] = []
        var t = start
        var i = 0.0
        while t < now {
            let bpm = 62 + 18 * sin(i / 9) + Double((Int(i) * 37) % 11) - 5
            buckets.append(HeartRateBucket(start: t, end: t + step, bpm: bpm))
            t += step
            i += 1
        }
        return HeartRateSnapshot(windowStart: start, windowEnd: now, buckets: buckets,
                                 latestBPM: Int(buckets.last?.bpm ?? 56), latestDate: now)
    }
}

enum HeartRateService {
    /// How far back the chart looks.
    static let window: TimeInterval = 12 * 60 * 60
    /// Width of each bar.
    static let bucket: TimeInterval = 10 * 60
    /// Shared between the app and the widget so the widget can fall back to the
    /// app's last fetch (HealthKit is unreadable while the phone is locked).
    static let appGroup = "group.com.aaronmoradi.heartbeat"

    static let store = HKHealthStore()
    static let heartRateType = HKQuantityType(.heartRate)
    private static let bpmUnit = HKUnit.count().unitDivided(by: .minute())
    private static let cacheKey = "lastSnapshot"

    static var isAvailable: Bool { HKHealthStore.isHealthDataAvailable() }

    static func requestAuthorization() async throws {
        try await store.requestAuthorization(toShare: [], read: [heartRateType])
    }

    /// Reads the last 12 hours from HealthKit, averaged into 10-minute bars.
    static func fetch(now: Date = .now) async throws -> HeartRateSnapshot {
        let start = now.addingTimeInterval(-window)
        let anchor = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: now)

        let collection = try await HKStatisticsCollectionQueryDescriptor(
            predicate: .quantitySample(type: heartRateType, predicate: predicate),
            options: .discreteAverage,
            anchorDate: anchor,
            intervalComponents: DateComponents(minute: Int(bucket / 60))
        ).result(for: store)

        var buckets: [HeartRateBucket] = []
        collection.enumerateStatistics(from: start, to: now) { stats, _ in
            if let avg = stats.averageQuantity()?.doubleValue(for: bpmUnit) {
                buckets.append(HeartRateBucket(start: stats.startDate, end: stats.endDate, bpm: avg))
            }
        }

        let latest = try await HKSampleQueryDescriptor(
            predicates: [.quantitySample(type: heartRateType)],
            sortDescriptors: [SortDescriptor(\.endDate, order: .reverse)],
            limit: 1
        ).result(for: store).first

        return HeartRateSnapshot(
            windowStart: start,
            windowEnd: now,
            buckets: buckets,
            latestBPM: latest.map { Int($0.quantity.doubleValue(for: bpmUnit).rounded()) },
            latestDate: latest?.endDate
        )
    }

    /// Fetches fresh data, caching it for the widget; falls back to the cache on failure.
    static func fetchOrCached(now: Date = .now) async -> HeartRateSnapshot? {
        if let fresh = try? await fetch(now: now), !fresh.isEmpty {
            save(fresh)
            return fresh
        }
        return loadCached()
    }

    static func save(_ snapshot: HeartRateSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        UserDefaults(suiteName: appGroup)?.set(data, forKey: cacheKey)
    }

    static func loadCached() -> HeartRateSnapshot? {
        guard let data = UserDefaults(suiteName: appGroup)?.data(forKey: cacheKey) else { return nil }
        return try? JSONDecoder().decode(HeartRateSnapshot.self, from: data)
    }
}
