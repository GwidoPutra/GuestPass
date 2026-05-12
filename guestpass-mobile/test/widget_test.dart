import 'package:flutter_test/flutter_test.dart';
import 'package:guestpass_mobile/app.dart';

void main() {
  testWidgets('App should build', (WidgetTester tester) async {
    await tester.pumpWidget(const App());
    expect(find.byType(App), findsOneWidget);
  });
}
