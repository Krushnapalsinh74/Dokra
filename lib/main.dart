import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'services/activity_service.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DokraApp());
}

class DokraApp extends StatelessWidget {
  const DokraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => ActivityService()),
      ],
      child: MaterialApp(
        title: 'DOKRA Runner',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0D0D0D),
          primaryColor: const Color(0xFFE53935),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFE53935),
            secondary: Color(0xFFE8B400),
            surface: Color(0xFF1E1E1E),
            background: Color(0xFF0D0D0D),
          ),
          textTheme: const TextTheme(
            titleLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold, fontSize: 22, color: Colors.white),
            bodyLarge: TextStyle(fontFamily: 'Inter', fontSize: 15, color: Colors.white),
            bodyMedium: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Color(0xFF9E9E9E)),
          ),
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
