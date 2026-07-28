import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/activity_service.dart';
import 'active_tracking_screen.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  String _getGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    if (m < 60) return "${m}m";
    return "${m ~/ 60}h ${m % 60}m";
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final activityService = Provider.of<ActivityService>(context);

    final user = authService.user;
    final firstName = user?.name.split(' ')[0] ?? 'Athlete';
    final currentStreak = user?.currentStreak ?? 0;

    final todayDist = activityService.todayDistance;
    final todayCal = activityService.todayCalories;
    final todayDur = activityService.todayDuration;
    final todaySteps = activityService.todaySteps;

    final weeklyDist = activityService.weeklyDistance;
    final weeklyGoal = activityService.weeklyGoal;
    final weeklyProgress = (weeklyDist / weeklyGoal).clamp(0.0, 1.0);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 100.0),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header (Greeting, Streak, Notifications)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getGreeting(),
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF9E9E9E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          firstName,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // Streak Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E1E1E),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF2A2A2A)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.flash_on, size: 14, color: Color(0xFFE8B400)),
                              const SizedBox(width: 4),
                              Text(
                                '$currentStreak',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFE8B400),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Notification Bell
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E1E1E),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF2A2A2A)),
                          ),
                          child: const Icon(Icons.notifications_none, size: 20, color: Colors.white),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // 2. Today Cumulative Card (Gradient Panel)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0x20E53935), Color(0x08E53935)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0x30E53935)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TODAY',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFE53935),
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _StatItem(value: todayDist.toStringAsFixed(1), unit: 'km', label: 'Distance'),
                        const _StatDivider(),
                        _StatItem(value: '$todayCal', unit: 'kcal', label: 'Calories'),
                        const _StatDivider(),
                        _StatItem(value: _formatDuration(todayDur), unit: '', label: 'Time'),
                        const _StatDivider(),
                        _StatItem(value: todaySteps > 0 ? '$todaySteps' : '--', unit: '', label: 'Steps'),
                      ],
                    ),
                  ],
                ),
              ),

              // 3. Quick Start Section
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Text(
                  'Quick Start',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Row(
                  children: [
                    Expanded(
                      child: _QuickStartBtn(
                        type: 'walk',
                        label: 'Walk',
                        icon: Icons.navigation_outlined,
                        color: const Color(0xFF00E676),
                        bgColor: const Color(0xFF001A0A),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _QuickStartBtn(
                        type: 'run',
                        label: 'Run',
                        icon: Icons.flash_on,
                        color: const Color(0xFFE53935),
                        bgColor: const Color(0xFF2D0A0A),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _QuickStartBtn(
                        type: 'cycle',
                        label: 'Cycle',
                        icon: Icons.directions_bike,
                        color: const Color(0xFF42A5F5),
                        bgColor: const Color(0xFF001020),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 4. Weekly Goal Card
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20.0),
                padding: const EdgeInsets.all(18.0),
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
                        const Text(
                          'Weekly Goal',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                        Text(
                          '${weeklyDist.toStringAsFixed(1)} / ${weeklyGoal.toInt()} km',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFE53935)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: weeklyProgress,
                        backgroundColor: const Color(0xFF2A2A2A),
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE53935)),
                        minHeight: 6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      weeklyProgress < 1.0
                          ? '${(weeklyGoal - weeklyDist).toStringAsFixed(1)} km remaining'
                          : 'Goal achieved! Keep going!',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 5. India Leaderboard Preview
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'India Leaderboard',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      'See All',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Theme.of(context).primaryColor),
                    ),
                  ],
                ),
              ),

              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2A2A2A)),
                ),
                child: Column(
                  children: [
                    _LeaderboardRow(rank: 1, name: 'Arjun S.', city: 'Mumbai', distance: 342.5, isCurrentUser: false),
                    _LeaderboardRow(rank: 2, name: 'Priya P.', city: 'Ahmedabad', distance: 318.2, isCurrentUser: false),
                    _LeaderboardRow(rank: 3, name: 'Rahul V.', city: 'Delhi', distance: 289.7, isCurrentUser: false),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Divider(color: Color(0xFF2A2A2A), height: 1),
                    ),
                    _LeaderboardRow(
                      rank: 47,
                      name: 'You',
                      city: user?.city ?? 'Ahmedabad',
                      distance: user?.totalDistance ?? 0.0,
                      isCurrentUser: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String unit;
  final String label;

  const _StatItem({required this.value, required this.unit, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: Alignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              if (unit.isNotEmpty) ...[
                const SizedBox(width: 2),
                Text(
                  unit,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF9E9E9E)),
                ),
              ],
            ],
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: Color(0xFF9E9E9E)),
          ),
        ],
      ),
    );
  }
}

class _StatDivider extends StatelessWidget {
  const _StatDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 36,
      color: const Color(0xFF2A2A2A),
    );
  }
}

class _QuickStartBtn extends StatelessWidget {
  final String type;
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;

  const _QuickStartBtn({
    required this.type,
    required this.label,
    required this.icon,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ActiveTrackingScreen(activityType: type)),
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF2A2A2A)),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, size: 24, color: color),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}

class _LeaderboardRow extends StatelessWidget {
  final int rank;
  final String name;
  final String city;
  final double distance;
  final bool isCurrentUser;

  const _LeaderboardRow({
    required this.rank,
    required this.name,
    required this.city,
    required this.distance,
    required this.isCurrentUser,
  });

  @override
  Widget build(BuildContext context) {
    final color = isCurrentUser
        ? const Color(0xFFE53935)
        : (rank <= 3 ? const Color(0xFFE8B400) : const Color(0xFF9E9E9E));

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: isCurrentUser
          ? BoxDecoration(
              color: const Color(0x15E53935),
              borderRadius: BorderRadius.circular(8),
            )
          : null,
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(
              '#$rank',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isCurrentUser ? const Color(0xFFE53935) : Colors.white,
                  ),
                ),
                Text(
                  city,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                ),
              ],
            ),
          ),
          Text(
            '${distance.toStringAsFixed(1)} km',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isCurrentUser ? const Color(0xFFE53935) : Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
