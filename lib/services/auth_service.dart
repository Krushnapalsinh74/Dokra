import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  bool _isAuthenticated = false;
  bool _hasSeenOnboarding = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  bool get hasSeenOnboarding => _hasSeenOnboarding;

  AuthService() {
    _loadState();
  }

  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _hasSeenOnboarding = prefs.getBool('has_seen_onboarding') ?? false;
      _isAuthenticated = prefs.getBool('is_authenticated') ?? false;

      if (_isAuthenticated) {
        final rawUser = prefs.getString('user_profile');
        if (rawUser != null) {
          _user = User.fromJson(jsonDecode(rawUser));
        } else {
          _user = User(
            id: 'u1',
            name: 'Krushnapalsinh',
            email: 'athlete@dokrarunner.in',
            city: 'Ahmedabad',
            totalDistance: 12.4,
            currentStreak: 5,
          );
          await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
        }
      }
    } catch (e) {
      debugPrint('Error loading auth state: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markOnboardingDone() async {
    _hasSeenOnboarding = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_onboarding', true);
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 800));

    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = true;
    _user = User(
      id: 'u1',
      name: 'Krushnapalsinh',
      email: email.isNotEmpty ? email : 'athlete@dokrarunner.in',
      city: 'Ahmedabad',
      totalDistance: 12.4,
      currentStreak: 5,
    );

    await prefs.setBool('is_authenticated', true);
    await prefs.setString('user_profile', jsonEncode(_user!.toJson()));

    _isLoading = false;
    notifyListeners();
    return true;
  }

  Future<void> updateProfile({required String name, required String city}) async {
    if (_user != null) {
      _user = _user!.copyWith(name: name, city: city);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
      notifyListeners();
    }
  }

  Future<void> addDistance(double distance) async {
    if (_user != null) {
      _user = _user!.copyWith(totalDistance: _user!.totalDistance + distance);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', jsonEncode(_user!.toJson()));
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_authenticated', false);
    await prefs.remove('user_profile');
    notifyListeners();
  }
}
