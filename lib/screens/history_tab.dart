import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/activity_service.dart';
import '../models/activity.dart';

class HistoryTab extends StatelessWidget {
  const HistoryTab({super.key});

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    if (m < 60) return "${m}m";
    return "${m ~/ 60}h ${m % 60}m";
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('EEEE, d MMMM yyyy').format(date);
    } catch (_) {
      return "Completed Activity";
    }
  }

  @override
  Widget build(BuildContext context) {
    final activityService = Provider.of<ActivityService>(context);
    final primaryColor = Theme.of(context).primaryColor;

    final allActivities = activityService.activities;

    final int totalWorkouts = allActivities.length;
    final double totalDistance = allActivities.fold(0.0, (sum, a) => sum + a.distance);
    final int totalCalories = allActivities.fold(0, (sum, a) => sum + a.calories);

    List<BarChartGroupData> barGroups = [];
    for (int i = 4; i >= 0; i--) {
      final day = DateTime.now().subtract(Duration(days: i));
      final dayStr = day.toIso8601String().substring(0, 10);
      final double distanceOnDay = allActivities
          .where((a) => a.date.startsWith(dayStr))
          .fold(0.0, (sum, a) => sum + a.distance);

      barGroups.add(
        BarChartGroupData(
          x: 4 - i,
          barRods: [
            BarChartRodData(
              toY: distanceOnDay > 0 ? distanceOnDay : 0.2,
              color: distanceOnDay > 0 ? primaryColor : Colors.white10,
              width: 16,
              borderRadius: BorderRadius.circular(4),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'History & Analytics',
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Your running performance graphs',
                        style: TextStyle(fontSize: 14, color: Color(0xFF9E9E9E)),
                      ),
                    ],
                  ),
                  if (allActivities.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.delete_sweep_outlined, color: Color(0xFFE53935)),
                      tooltip: 'Clear History',
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Clear all history?'),
                            content: const Text('This will delete all completed walks, runs, and rides permanently.'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () {
                                  activityService.clearAll();
                                  Navigator.pop(context);
                                },
                                child: const Text('Clear All', style: TextStyle(color: Color(0xFFE53935))),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 100.0),
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF2A2A2A)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _StatChip(value: '$totalWorkouts', label: 'WORKOUTS'),
                          _StatChip(value: '${totalDistance.toStringAsFixed(1)}k', label: 'TOTAL KM'),
                          _StatChip(value: '$totalCalories', label: 'KCAL BURNED'),
                        ],
                      ),
                    ),

                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                      child: Text(
                        'Weekly Performance Progress',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),

                    Container(
                      height: 180,
                      margin: const EdgeInsets.symmetric(horizontal: 20.0),
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF2A2A2A)),
                      ),
                      child: BarChart(
                        BarChartData(
                          alignment: BarChartAlignment.spaceAround,
                          maxY: (totalDistance / 2).clamp(5.0, 100.0),
                          barTouchData: BarTouchData(enabled: false),
                          titlesData: FlTitlesData(
                            show: true,
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (double value, TitleMeta meta) {
                                  final int index = value.toInt();
                                  if (index < 0 || index >= 5) return const SizedBox.shrink();
                                  final day = DateTime.now().subtract(Duration(days: 4 - index));
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      DateFormat('E').format(day),
                                      style: const TextStyle(color: Color(0xFF9E9E9E), fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  );
                                },
                              ),
                            ),
                            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          ),
                          gridData: const FlGridData(show: false),
                          borderData: FlBorderData(show: false),
                          barGroups: barGroups,
                        ),
                      ),
                    ),

                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                      child: Text(
                        'Activity Logs',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),

                    if (allActivities.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: Column(
                            children: [
                              Icon(Icons.history, size: 48, color: Color(0xFF4A4444)),
                              SizedBox(height: 12),
                              Text(
                                'No logged runs yet. Start an activity to track!',
                                style: TextStyle(color: Color(0xFF9E9E9E), fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: allActivities.length,
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        itemBuilder: (context, index) {
                          final a = allActivities[index];
                          final String typeLabel = a.type[0].toUpperCase() + a.type.substring(1);
                          final Color typeColor = a.type == 'run'
                              ? const Color(0xFFE53935)
                              : (a.type == 'walk' ? const Color(0xFF00E676) : const Color(0xFF42A5F5));

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E1E1E),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFF2A2A2A)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: typeColor.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        typeLabel,
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: typeColor),
                                      ),
                                    ),
                                    Text(
                                      '${a.distance.toStringAsFixed(2)} km',
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _formatDate(a.date),
                                  style: const TextStyle(fontSize: 13, color: Colors.white70, fontWeight: FontWeight.w500),
                                ),
                                const SizedBox(height: 8),
                                const Divider(color: Color(0xFF2A2A2A), height: 1),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    _MiniMetric(icon: Icons.timer_outlined, value: _formatDuration(a.duration), label: 'DURATION'),
                                    _MiniMetric(icon: Icons.local_fire_department_outlined, value: '${a.calories} kcal', label: 'ENERGY'),
                                    if (a.steps != null)
                                      _MiniMetric(icon: Icons.directions_walk_outlined, value: '${a.steps}', label: 'STEPS'),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String value;
  final String label;

  const _StatChip({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF9E9E9E), fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
      ],
    );
  }
}

class _MiniMetric extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _MiniMetric({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: const Color(0xFF9E9E9E)),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: Color(0xFF9E9E9E), letterSpacing: 0.5),
        ),
      ],
    );
  }
}
