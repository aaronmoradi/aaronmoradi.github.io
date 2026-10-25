import SwiftUI
import WidgetKit

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var snapshot: HeartRateSnapshot?
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    card {
                        HeartRateChartView(snapshot: snapshot ?? .empty(), calloutScale: 1.2)
                            .frame(height: 220)
                    }

                    if let snapshot, !snapshot.isEmpty {
                        stats(for: snapshot)
                    }

                    if let error {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }

                    Text("Add the widget: long-press your Home Screen, tap Edit › Add Widget, and search for Heartbeat.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding()
            }
            .navigationTitle("Heartbeat")
            .refreshable { await load() }
            .toolbar {
                Button { Task { await load() } } label: { Image(systemName: "arrow.clockwise") }
            }
        }
        .preferredColorScheme(.dark)
        .task { await load() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { Task { await load() } }
        }
    }

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        content()
            .padding(14)
            .background(HeartbeatStyle.background, in: RoundedRectangle(cornerRadius: 22))
    }

    private func stats(for snapshot: HeartRateSnapshot) -> some View {
        let values = snapshot.buckets.map(\.bpm)
        let avg = values.reduce(0, +) / Double(values.count)
        return HStack {
            stat("Low", values.min() ?? 0, HeartbeatStyle.resting)
            stat("Average", avg, .white)
            stat("High", values.max() ?? 0, HeartbeatStyle.elevated)
        }
    }

    private func stat(_ label: String, _ value: Double, _ color: Color) -> some View {
        VStack(spacing: 4) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text("\(Int(value.rounded()))").font(.title2.bold()).foregroundStyle(color)
            Text("bpm").font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(HeartbeatStyle.background, in: RoundedRectangle(cornerRadius: 16))
    }

    private func load() async {
        guard HeartRateService.isAvailable else {
            error = "Health data isn't available on this device."
            return
        }
        do {
            try await HeartRateService.requestAuthorization()
            let fresh = try await HeartRateService.fetch()
            HeartRateService.save(fresh)
            snapshot = fresh
            error = nil
            WidgetCenter.shared.reloadAllTimelines()
        } catch {
            snapshot = HeartRateService.loadCached()
            self.error = error.localizedDescription
        }
    }
}

#Preview {
    ContentView()
}
