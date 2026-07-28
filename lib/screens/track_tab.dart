import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/activity_service.dart';
import '../models/activity.dart';
import 'active_tracking_screen.dart';

class TrackTab extends StatefulWidget {
  const TrackTab({super.key});

  @override
  State<TrackTab> createState() => _TrackTabState();
}

class _TrackTabState extends State<TrackTab> {
  String _selectedType = 'run';

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    if (m < 60) return "${m}m";
    return "${m ~/ 60}h ${m % 60}m";
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date).inDays;

      if (diff == 0 && date.day == now.day) {
        return "Today";
      } else if (diff == 1 || (diff == 0 && date.day != now.day)) {
        return "Yesterday";
      } else {
        return DateFormat('d MMM').format(date);
      }
    } catch (_) {
      return "Recent";
    }
  }

  @override
  Widget build(BuildContext context) {
    final activityService = Provider.of<ActivityService>(context);
    final primaryColor = Theme.of(context).primaryColor;

    final recentActivities = activityService.activities.take(5).toList();

    final List<Map<String, dynamic>> activityTypes = [
      {
        'type': 'walk',
        'icon': Icons.navigation_outlined,
        'label': 'Walk',
        'color': const Color(0xFF00E676),
        'bgColor': const Color(0xFF001A0A),
      },
      {
        'type': 'run',
        'icon': Icons.flash_on,
        'label': 'Run',
        'color': const Color(0xFFE53935),
        'bgColor': const Color(0xFF2D0A0A),
      },
      {
        'type': 'cycle',
        'icon': Icons.directions_bike,
        'label': 'Cycle',
        'color': const Color(0xFF42A5F5),
        'bgColor': const Color(0xFF001020),
      },
    ];

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 100.0),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header Title & Subtitle
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Start Activity',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Choose your workout type',
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFF9E9E9E),
                      ),
                    ),
                  ],
                ),
              ),

              // 2. Selection grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Row(
                  children: activityTypes.map((a) {
                    final isSelected = _selectedType == a['type'];
                    final Color cardColor = a['color'] as Color;
                    final Color itemBgColor = a['bgColor'] as Color;

                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedType = a['type'];
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 6.0),
                          padding: const EdgeInsets.all(16.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E1E1E),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? cardColor : const Color(0xFF2A2A2A),
                              width: isSelected ? 2.0 : 1.0,
                            ),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: itemBgColor,
                                  borderRadius: BorderRadius.circular(18),
                                ),
                                child: Icon(a['icon'] as IconData, size: 28, color: cardColor),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                a['label'] as String,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 6),
                              if (isSelected)
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: cardColor,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 12),

              // 3. Start button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ActiveTrackingScreen(activityType: _selectedType),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    minimumSize: const Size.fromHeight(56),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.play_arrow, size: 20, color: Colors.white),
                      const SizedBox(width: 10),
                      Text(
                        'Start ${_selectedType[0].toUpperCase()}${_selectedType.substring(1)}',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // 4. Recent activities list
              if (recentActivities.isNotEmpty) ...[
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                  child: Text(
                    'Recent Activities',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: recentActivities.length,
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  itemBuilder: (context, index) {
                    final activity = recentActivities[index];
                    final cfg = activityTypes.firstWhere(
                      (x) => x['type'] == activity.type,
                      orElse: () => activityTypes[1], // default to run
                    );

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10.0),
                      padding: const EdgeInsets.all(14.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF2A2A2A)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: cfg['bgColor'] as Color,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(cfg['icon'] as IconData, size: 18, color: cfg['color'] as Color),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  cfg['label'] as String,
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _formatDate(activity.date),
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${activity.distance.toStringAsFixed(2)} km',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _formatDuration(activity.duration),
                                style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
