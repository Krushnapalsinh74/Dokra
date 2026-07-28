import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/activity.dart';

class ActivityService extends ChangeNotifier {
  List<Activity> _activities = [];
  bool _isLoading = true;
  double _weeklyGoal = 50.0;

  List<Activity> get activities => _activities;
  bool get isLoading => _isLoading;
  double get weeklyGoal => _weeklyGoal;

  double get todayDistance {
    return _getTodayActivities().fold(0.0, (sum, a) => sum + a.distance);
  }

  int get todayCalories {
    return _getTodayActivities().fold(0, (sum, a) => sum + a.calories);
  }

  int get todayDuration {
    return _getTodayActivities().fold(0, (sum, a) => sum + a.duration);
  }

  int get todaySteps {
    return _getTodayActivities().fold(0, (sum, a) => sum + (a.steps ?? 0));
  }

  double get weeklyDistance {
    final now = DateTime.now();
    final sevenDaysAgo = now.subtract(const Duration(days: 7));
    return _activities
        .where((a) => DateTime.parse(a.date).isAfter(sevenDaysAgo))
        .fold(0.0, (sum, a) => sum + a.distance);
  }

  ActivityService() {
    _loadActivities();
  }

  List<Activity> _getTodayActivities() {
    final todayStr = DateTime.now().toIso8601String().substring(0, 10);
    return _activities.where((a) => a.date.startsWith(todayStr)).toList();
  }

  Future<void> _loadActivities() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString('@dokra_activities');
      if (raw != null) {
        final List<dynamic> list = jsonDecode(raw);
        _activities = list.map((item) => Activity.fromJson(item)).toList();
      } else {
        _activities = [
          Activity(
            id: 'act1',
            type: 'run',
            distance: 5.2,
            calories: 340,
            duration: 1800,
            steps: 6200,
            date: DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
          ),
          Activity(
            id: 'act2',
            type: 'walk',
            distance: 3.1,
            calories: 180,
            duration: 2400,
            steps: 4500,
            date: DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
          ),
          Activity(
            id: 'act3',
            type: 'cycle',
            distance: 12.0,
            calories: 450,
            duration: 3600,
            date: DateTime.now().subtract(const Duration(hours: 12)).toIso8601String(),
          ),
        ];
        await _saveToPrefs();
      }
    } catch (e) {
      debugPrint('Error loading activities: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(_activities.map((a) => a.toJson()).toList());
    await prefs.setString('@dokra_activities', raw);
  }

  Future<void> addActivity(Activity activity) async {
    _activities.insert(0, activity);
    await _saveToPrefs();
    notifyListeners();
  }

  Future<void> updateWeeklyGoal(double newGoal) async {
    _weeklyGoal = newGoal;
    notifyListeners();
  }

  Future<void> clearAll() async {
    _activities.clear();
    await _saveToPrefs();
    notifyListeners();
  }
}
