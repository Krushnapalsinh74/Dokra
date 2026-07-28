import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class LeaderboardEntry {
  final int rank;
  final String name;
  final String city;
  final String state;
  final double distance;

  LeaderboardEntry({
    required this.rank,
    required this.name,
    required this.city,
    required this.state,
    required this.distance,
  });
}

class LeaderboardTab extends StatefulWidget {
  const LeaderboardTab({super.key});

  @override
  State<LeaderboardTab> createState() => _LeaderboardTabState();
}

class _LeaderboardTabState extends State<LeaderboardTab> {
  String _selectedState = 'All India';
  String _searchQuery = '';

  final List<String> _statesList = [
    'All India',
    'Gujarat',
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
  ];

  final List<LeaderboardEntry> _allEntries = [
    LeaderboardEntry(rank: 1, name: "Arjun S.", city: "Mumbai", state: "Maharashtra", distance: 342.5),
    LeaderboardEntry(rank: 2, name: "Priya P.", city: "Ahmedabad", state: "Gujarat", distance: 318.2),
    LeaderboardEntry(rank: 3, name: "Rahul V.", city: "Delhi", state: "Delhi", distance: 289.7),
    LeaderboardEntry(rank: 4, name: "Ananya K.", city: "Bangalore", state: "Karnataka", distance: 245.1),
    LeaderboardEntry(rank: 5, name: "Vikram R.", city: "Chennai", state: "Tamil Nadu", distance: 221.8),
    LeaderboardEntry(rank: 6, name: "Siddharth J.", city: "Pune", state: "Maharashtra", distance: 198.3),
    LeaderboardEntry(rank: 7, name: "Meera D.", city: "Surat", state: "Gujarat", distance: 185.0),
    LeaderboardEntry(rank: 8, name: "Aarav M.", city: "Rajkot", state: "Gujarat", distance: 172.4),
    LeaderboardEntry(rank: 9, name: "Karan S.", city: "Vadodara", state: "Gujarat", distance: 156.9),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final user = authService.user;
    final primaryColor = Theme.of(context).primaryColor;

    // Filter list based on selected state and search query
    List<LeaderboardEntry> filteredEntries = _allEntries.where((entry) {
      final matchesState = _selectedState == 'All India' || entry.state == _selectedState;
      final matchesQuery = entry.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          entry.city.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesState && matchesQuery;
    }).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Title Header
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Text(
                'India Leaderboard',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),

            // 2. Filters Row & Search Box
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 6.0),
              child: Row(
                children: [
                  // State dropdown
                  Expanded(
                    flex: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF2A2A2A)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedState,
                          dropdownColor: const Color(0xFF1E1E1E),
                          icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
                          isExpanded: true,
                          style: const TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.w500),
                          items: _statesList.map((String value) {
                            return DropdownMenuItem<String>(
                              value: value,
                              child: Text(value),
                            );
                          }).toList(),
                          onChanged: (newValue) {
                            if (newValue != null) {
                              setState(() {
                                _selectedState = newValue;
                              });
                            }
                          },
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Search Text Field
                  Expanded(
                    flex: 6,
                    child: TextField(
                      style: const TextStyle(fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search city/athlete...',
                        prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF9E9E9E)),
                        filled: true,
                        fillColor: const Color(0xFF1E1E1E),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                      ),
                      onChanged: (val) {
                        setState(() {
                          _searchQuery = val;
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 3. Leaderboard List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                physics: const BouncingScrollPhysics(),
                itemCount: filteredEntries.length,
                itemBuilder: (context, index) {
                  final entry = filteredEntries[index];
                  final isTop3 = entry.rank <= 3;
                  final Color rankColor = isTop3 ? const Color(0xFFE8B400) : const Color(0xFF9E9E9E);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2A2A2A)),
                    ),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 32,
                          child: Text(
                            '#${entry.rank}',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: rankColor),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.name,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${entry.city}, ${entry.state}',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${entry.distance.toStringAsFixed(1)} km',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // 4. Highlighted User Rank Card
            Container(
              padding: EdgeInsets.only(
                left: 20.0,
                right: 20.0,
                top: 14.0,
                bottom: MediaQuery.of(context).padding.bottom + 14.0,
              ),
              decoration: const BoxDecoration(
                color: Color(0xFF161616),
                border: Border(top: BorderSide(color: Color(0xFF2A2A2A))),
              ),
              child: Row(
                children: [
                  Text(
                    '#47',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryColor),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'You',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.city ?? 'Ahmedabad',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${(user?.totalDistance ?? 0.0).toStringAsFixed(1)} km',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryColor),
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
