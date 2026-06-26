import 'package:flutter_test/flutter_test.dart';
import 'package:ta3lem_app/main.dart';

void main() {
  testWidgets('App renders without error', (WidgetTester tester) async {
    await tester.pumpWidget(const Ta3lemApp());
    await tester.pump();
    expect(find.text('منصة تعليم'), findsOneWidget);
  });
}
