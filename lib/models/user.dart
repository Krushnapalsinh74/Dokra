class User {
  final String id;
  final String name;
  final String email;
  final String city;
  final double totalDistance;
  final int currentStreak;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.city,
    required this.totalDistance,
    required this.currentStreak,
  });

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? city,
    double? totalDistance,
    int? currentStreak,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      city: city ?? this.city,
      totalDistance: totalDistance ?? this.totalDistance,
      currentStreak: currentStreak ?? this.currentStreak,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Athlete',
      email: json['email'] ?? '',
      city: json['city'] ?? 'Your City',
      totalDistance: (json['totalDistance'] as num?)?.toDouble() ?? 0.0,
      currentStreak: json['currentStreak'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'city': city,
      'totalDistance': totalDistance,
      'currentStreak': currentStreak,
    };
  }
}
