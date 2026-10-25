import Charts
import SwiftUI

enum HeartbeatStyle {
    static let background = Color(red: 0.10, green: 0.11, blue: 0.14)
    static let elevated = Color(red: 1.00, green: 0.58, blue: 0.12)
    static let resting = Color(red: 0.10, green: 0.66, blue: 0.95)
    static let grid = Color.white.opacity(0.35)

    /// Bars at or above this average are drawn orange, below it blue.
    static let elevatedThreshold = 62.0

    static func color(for bpm: Double) -> Color {
        bpm >= elevatedThreshold ? elevated : resting
    }
}

/// The Cardiogram-style bar chart: orange/blue bars, dashed gridlines labelled
/// on the right, hour labels along the bottom and a latest-reading callout.
struct HeartRateChartView: View {
    let snapshot: HeartRateSnapshot
    var calloutScale: CGFloat = 1

    private var yDomain: ClosedRange<Double> {
        let values = snapshot.buckets.map(\.bpm)
        let low = (((values.min() ?? 50) - 5) / 10).rounded(.down) * 10
        let high = (((values.max() ?? 100) + 10) / 10).rounded(.up) * 10
        return min(40, low)...max(110, high)
    }

    private var gridValues: [Double] {
        stride(from: 60.0, through: yDomain.upperBound - 5, by: 20).map { $0 }
    }

    var body: some View {
        let floor = yDomain.lowerBound
        Chart(snapshot.buckets) { b in
            RectangleMark(
                xStart: .value("Start", b.start),
                xEnd: .value("End", b.end.addingTimeInterval(-HeartRateService.bucket * 0.25)),
                yStart: .value("Floor", floor),
                yEnd: .value("BPM", b.bpm)
            )
            .foregroundStyle(HeartbeatStyle.color(for: b.bpm))
            .cornerRadius(1)
        }
        .chartXScale(domain: snapshot.windowStart...snapshot.windowEnd)
        .chartYScale(domain: yDomain)
        .chartXAxis {
            AxisMarks(values: .stride(by: .hour, count: 3)) { _ in
                AxisValueLabel(format: .dateTime.hour(.twoDigits(amPM: .omitted)), centered: false)
                    .foregroundStyle(.white.opacity(0.85))
                    .font(.system(size: 11, weight: .medium))
            }
        }
        .chartYAxis {
            AxisMarks(position: .trailing, values: gridValues) { _ in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.6, dash: [2, 3]))
                    .foregroundStyle(HeartbeatStyle.grid)
                AxisValueLabel()
                    .foregroundStyle(.white)
                    .font(.system(size: 12, weight: .semibold))
            }
        }
        .overlay(alignment: .topLeading) {
            if let bpm = snapshot.latestBPM {
                LatestCallout(bpm: bpm, date: snapshot.latestDate)
                    .scaleEffect(calloutScale, anchor: .topLeading)
            }
        }
        .overlay {
            if snapshot.isEmpty {
                Text("No heart rate in the last 12 hours")
                    .font(.footnote)
                    .foregroundStyle(.white.opacity(0.6))
            }
        }
    }
}

private struct LatestCallout: View {
    let bpm: Int
    let date: Date?

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            HStack(spacing: 3) {
                Image(systemName: "heart.fill").foregroundStyle(.red)
                Text("\(bpm)").fontWeight(.bold).foregroundStyle(.white)
            }
            .font(.system(size: 15))
            if let date {
                Text(date, format: .dateTime.hour(.twoDigits(amPM: .omitted)).minute())
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 7))
    }
}
