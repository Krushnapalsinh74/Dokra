import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dokra_runner/main.dart';

void main() {
  testWidgets('DokraApp Splash Screen Smoke Test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const DokraApp());

    // Verify that the splash screen shows the tagline text "RUN  •  WALK  •  RIDE".
    expect(find.text('RUN  •  WALK  •  RIDE'), findsOneWidget);
  });
}
