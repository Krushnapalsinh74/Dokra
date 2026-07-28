import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/activity_service.dart';
import '../services/auth_service.dart';
import '../models/activity.dart';

class ActiveTrackingScreen extends StatefulWidget {
  final String activityType;

  const ActiveTrackingScreen({super.key, required this.activityType});

  @override
  State<ActiveTrackingScreen> createState() => _ActiveTrackingScreenState();
}

class _ActiveTrackingScreenState extends State<ActiveTrackingScreen> {
  Timer? _timer;
  int _secondsElapsed = 0;
  bool _isTracking = true;

  double _distance = 0.0;
  int _calories = 0;
  int _steps = 0;
  final List<Coordinate> _simulatedRoute = [];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isTracking) {
        setState(() {
          _secondsElapsed++;

          // Simulate active GPS tracking increments
          double speedMultiplier = 1.0;
          if (widget.activityType == 'run') {
            speedMultiplier = 2.8; // ~10 km/h
          } else if (widget.activityType == 'cycle') {
            speedMultiplier = 5.5; // ~20 km/h
          } else {
            speedMultiplier = 1.4; // ~5 km/h (walk)
          }

          // Distance increments: speed * time in hours (1s = 1/3600h)
          final double distanceIncrement = (speedMultiplier / 3600.0) * (0.9 + Random().nextDouble() * 0.2);
          _distance += distanceIncrement;

          // Calories burn calculation
          if (widget.activityType == 'run') {
            _calories = (_secondsElapsed * 0.18).toInt();
            _steps += (Random().nextDouble() * 3 + 1).toInt();
          } else if (widget.activityType == 'cycle') {
            _calories = (_secondsElapsed * 0.12).toInt();
          } else {
            _calories = (_secondsElapsed * 0.08).toInt();
            _steps += (Random().nextDouble() * 2 + 1).toInt();
          }

          // Accumulate route coordinates (Simulate Ahmedabad path coordinates)
          final double baseLat = 23.0225;
          final double baseLng = 72.5714;
          final double offset = _distance * 0.009; // Simple conversion multiplier from km to degrees
          _simulatedRoute.add(
            Coordinate(
              latitude: baseLat + offset * sin(_secondsElapsed * 0.05),
              longitude: baseLng + offset * cos(_secondsElapsed * 0.05),
            ),
          );
        });
      }
    });
  }

  String _formatTimer(int totalSecs) {
    final h = (totalSecs ~/ 3600).toString().padLeft(2, '0');
    final m = ((totalSecs % 3600) ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return "$h:$m:$s";
  }

  String _calculatePace() {
    if (_distance == 0.0) return "0'00\"";
    final double paceDecimal = (_secondsElapsed / 60.0) / _distance;
    final int paceMin = paceDecimal.toInt();
    final int paceSec = ((paceDecimal - paceMin) * 60).toInt();
    return "$paceMin'${paceSec.toString().padLeft(2, '0')}\"";
  }

  void _toggleTracking() {
    setState(() {
      _isTracking = !_isTracking;
    });
  }

  Future<void> _finishActivity() async {
    final activityService = Provider.of<ActivityService>(context, listen: false);
    final authService = Provider.of<AuthService>(context, listen: false);

    // Create completed activity model
    final newActivity = Activity(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: widget.activityType,
      distance: _distance,
      calories: _calories,
      duration: _secondsElapsed,
      steps: widget.activityType != 'cycle' ? _steps : null,
      date: DateTime.now().toIso8601String(),
      route: _simulatedRoute,
    );

    await activityService.addActivity(newActivity);
    await authService.addDistance(_distance);

    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String typeTitle = widget.activityType[0].toUpperCase() + widget.activityType.substring(1);
    final Color accentColor = widget.activityType == 'run'
        ? const Color(0xFFE53935)
        : (widget.activityType == 'walk' ? const Color(0xFF00E676) : const Color(0xFF42A5F5));

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        title: Text('ACTIVE $typeTitle'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Connection Status Bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF00E676),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'GPS Connected (High Accuracy)',
                    style: TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // 2. Primary Timer
            Text(
              _formatTimer(_secondsElapsed),
              style: const TextStyle(
                fontSize: 68,
                fontWeight: FontWeight.bold,
                fontFamily: 'Courier',
                color: Colors.white,
                letterSpacing: 2,
              ),
            ),
            const Text(
              'ELAPSED TIME',
              style: TextStyle(fontSize: 12, color: Color(0xFF9E9E9E), letterSpacing: 2),
            ),

            const Spacer(),

            // 3. Distance Counter
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: Alignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  _distance.toStringAsFixed(2),
                  style: const TextStyle(fontSize: 80, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(width: 6),
                const Text(
                  'km',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF9E9E9E)),
                ),
              ],
            ),
            const Text(
              'DISTANCE',
              style: TextStyle(fontSize: 12, color: Color(0xFF9E9E9E), letterSpacing: 2),
            ),

            const Spacer(),

            // 4. Pace, Calories, Steps Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _MetricDisplay(value: _calculatePace(), label: 'AVG PACE'),
                  _MetricDisplay(value: '$_calories', label: 'CALORIES'),
                  if (widget.activityType != 'cycle')
                    _MetricDisplay(value: '$_steps', label: 'STEPS'),
                ],
              ),
            ),

            const Spacer(flex: 2),

            // 5. Controls Panel
            Padding(
              padding: const EdgeInsets.only(bottom: 40.0, left: 24.0, right: 24.0),
              child: Row(
                children: [
                  // Play/Pause button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _toggleTracking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isTracking ? const Color(0xFF1E1E1E) : accentColor,
                        foregroundColor: _isTracking ? Colors.white : Colors.black,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                          side: BorderSide(color: _isTracking ? const Color(0xFF2A2A2A) : Colors.transparent),
                        ),
                        minimumSize: const Size.fromHeight(60),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_isTracking ? Icons.pause : Icons.play_arrow, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            _isTracking ? 'PAUSE' : 'RESUME',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Stop/Finish button (Only active when paused to prevent accidental finishes)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _finishActivity,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE53935),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                        ),
                        minimumSize: const Size.fromHeight(60),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.stop, size: 24),
                          SizedBox(width: 8),
                          Text(
                            'FINISH',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricDisplay extends StatelessWidget {
  final String value;
  final String label;

  const _MetricDisplay({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF9E9E9E), letterSpacing: 1),
        ),
      ],
    );
  }
}
