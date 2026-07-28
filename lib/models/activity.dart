class Coordinate {
  final double latitude;
  final double longitude;

  Coordinate({required this.latitude, required this.longitude});

  Map<String, double> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  factory Coordinate.fromJson(Map<String, dynamic> json) {
    return Coordinate(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
  }
}

class Activity {
  final String id;
  final String type; // 'walk', 'run', 'cycle'
  final double distance; // in km
  final int calories; // in kcal
  final int duration; // in seconds
  final int? steps;
  final String date; // ISO date string
  final List<Coordinate> route;

  Activity({
    required this.id,
    required this.type,
    required this.distance,
    required this.calories,
    required this.duration,
    this.steps,
    required this.date,
    this.route = const [],
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    var list = json['route'] as List?;
    List<Coordinate> routeList = list != null
        ? list.map((i) => Coordinate.fromJson(i as Map<String, dynamic>)).toList()
        : [];

    return Activity(
      id: json['id'] ?? '',
      type: json['type'] ?? 'run',
      distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
      calories: json['calories'] ?? 0,
      duration: json['duration'] ?? 0,
      steps: json['steps'],
      date: json['date'] ?? DateTime.now().toIso8601String(),
      route: routeList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'distance': distance,
      'calories': calories,
      'duration': duration,
      'steps': steps,
      'date': date,
      'route': route.map((c) => c.toJson()).toList(),
    };
  }
}
