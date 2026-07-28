import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/activity_service.dart';
import 'auth/login_screen.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  void _showEditProfileDialog(BuildContext context, AuthService authService) {
    final nameController = TextEditingController(text: authService.user?.name);
    final cityController = TextEditingController(text: authService.user?.city);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Edit Profile'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: cityController,
                decoration: const InputDecoration(
                  labelText: 'City',
                  prefixIcon: Icon(Icons.location_city_outlined),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                if (nameController.text.trim().isNotEmpty && cityController.text.trim().isNotEmpty) {
                  authService.updateProfile(
                    name: nameController.text.trim(),
                    city: cityController.text.trim(),
                  );
                }
                Navigator.pop(context);
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final activityService = Provider.of<ActivityService>(context);
    final user = authService.user;
    final primaryColor = Theme.of(context).primaryColor;

    final totalRuns = activityService.activities.length;
    final totalDistance = user?.totalDistance ?? 0.0;
    final currentStreak = user?.currentStreak ?? 0;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 100.0),
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 24),

              // 1. Profile Avatar & Name
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 54,
                      backgroundColor: primaryColor.withOpacity(0.12),
                      child: Icon(Icons.person, size: 54, color: primaryColor),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user?.name ?? 'Athlete',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${user?.city ?? 'Ahmedabad'}, India',
                      style: const TextStyle(fontSize: 14, color: Color(0xFF9E9E9E)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 2. Performance Stats Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Row(
                  children: [
                    _ProfileStatCard(value: '${totalDistance.toStringAsFixed(1)} km', label: 'TOTAL DIST'),
                    const SizedBox(width: 12),
                    _ProfileStatCard(value: '$totalRuns', label: 'ACTIVITIES'),
                    const SizedBox(width: 12),
                    _ProfileStatCard(value: '$currentStreak days', label: 'STREAK'),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 3. Unlocked Achievements Cards
              const Align(
                alignment: Alignment.centerLeft,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                  child: Text(
                    'Unlocked Achievements',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),

              SizedBox(
                height: 120,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 14.0),
                  physics: const BouncingScrollPhysics(),
                  children: const [
                    _AchievementBadge(
                      icon: Icons.military_tech,
                      title: 'Gold Runner',
                      subtitle: 'Run a 10km run',
                      color: Color(0xFFE8B400),
                    ),
                    _AchievementBadge(
                      icon: Icons.navigation,
                      title: 'Silver Walker',
                      subtitle: 'Walk a 5km walk',
                      color: Color(0xFF9E9E9E),
                    ),
                    _AchievementBadge(
                      icon: Icons.directions_bike,
                      title: 'Bronze Cyclist',
                      subtitle: 'Ride a 15km ride',
                      color: Color(0xFFCD7F32),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 4. Settings List & Customizations Card
              const Align(
                alignment: Alignment.centerLeft,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                  child: Text(
                    'Settings & Preferences',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),

              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2A2A2A)),
                ),
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.edit_outlined,
                      title: 'Edit Profile Information',
                      onTap: () => _showEditProfileDialog(context, authService),
                    ),
                    const Divider(color: Color(0xFF2A2A2A), height: 1),
                    const _SettingsTile(
                      icon: Icons.settings_outlined,
                      title: 'Preferences (Units: Metric km)',
                    ),
                    const Divider(color: Color(0xFF2A2A2A), height: 1),
                    _SettingsTile(
                      icon: Icons.logout_outlined,
                      title: 'Logout athlete session',
                      titleColor: const Color(0xFFE53935),
                      iconColor: const Color(0xFFE53935),
                      onTap: () async {
                        await authService.logout();
                        if (context.mounted) {
                          Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                            (route) => false,
                          );
                        }
                      },
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

class _ProfileStatCard extends StatelessWidget {
  final String value;
  final String label;

  const _ProfileStatCard({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF2A2A2A)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF9E9E9E), fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

class _AchievementBadge extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const _AchievementBadge({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 28, color: color),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 10, color: Color(0xFF9E9E9E)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color? titleColor;
  final Color? iconColor;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.titleColor,
    this.iconColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: iconColor ?? Colors.white70, size: 20),
      title: Text(
        title,
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: titleColor ?? Colors.white),
      ),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFF555555), size: 18),
    );
  }
}
