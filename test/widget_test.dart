import 'package:flutter_test/flutter_test.dart';
import 'package:forge/main.dart';

void main() {
  test('the application root is Forge', () {
    expect(const Forge(), isA<Forge>());
  });
}
