import 'package:flutter_test/flutter_test.dart';
import 'package:forge/widgets/desktop/desktop_shell.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  testWidgets('desktop top bar builds without material or layout errors', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DesktopTopBar(onSettings: () {}, onAbout: () {}),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(find.text('Forge'), findsOneWidget);
    expect(find.byTooltip('Settings'), findsOneWidget);
  });
}
