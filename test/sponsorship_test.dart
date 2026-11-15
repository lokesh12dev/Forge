/*
 *     Copyright (C) 2026 Lokesh
 *
 *     Forge is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Forge is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 *     For more information about Forge, including how to contribute,
 *     please visit: https://github.com/lokesh12dev/Forge
 */

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:forge/constants/payment_constants.dart';
import 'package:forge/widgets/sponsorship_dialog.dart';

Widget _buildTestApp({required Widget home}) {
  return MaterialApp(
    theme: ThemeData.dark(),
    localizationsDelegates: const [
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const [Locale('en')],
    home: home,
  );
}

void main() {
  group('Dual UPI Sponsorship Configuration Tests', () {
    test('Google Pay configuration verified', () {
      final gpay = SponsorshipConfig.googlePay;
      expect(gpay.type, UpiPaymentMethodType.googlePay);
      expect(gpay.title, 'Google Pay');
      expect(gpay.upiId, 'mr.mlokesh7@oksbi');
      expect(gpay.payeeName, 'M Lokesh');
      expect(gpay.assetPath, 'assets/payments/upigpay.jpeg');

      // Verify Flexible URI
      final uri = gpay.paymentUri;
      expect(uri.scheme, 'upi');
      expect(uri.host, 'pay');
      expect(uri.queryParameters['pa'], 'mr.mlokesh7@oksbi');
      expect(uri.queryParameters['pn'], 'M Lokesh');
      expect(uri.queryParameters['cu'], 'INR');
      expect(uri.queryParameters['tn'], 'Support Forge by Lokesh');
      expect(uri.queryParameters.containsKey('am'), isFalse,
          reason: 'No fixed amount parameter must be set for flexible payment');
    });

    test('PhonePe configuration verified', () {
      final phonepe = SponsorshipConfig.phonePe;
      expect(phonepe.type, UpiPaymentMethodType.phonePe);
      expect(phonepe.title, 'PhonePe');
      expect(phonepe.upiId, '7603883879@axl');
      expect(phonepe.payeeName, 'LOKESH M');
      expect(phonepe.assetPath, 'assets/payments/phoneupi.jpeg');

      // Verify Flexible URI
      final uri = phonepe.paymentUri;
      expect(uri.scheme, 'upi');
      expect(uri.host, 'pay');
      expect(uri.queryParameters['pa'], '7603883879@axl');
      expect(uri.queryParameters['pn'], 'LOKESH M');
      expect(uri.queryParameters['cu'], 'INR');
      expect(uri.queryParameters['tn'], 'Support Forge by Lokesh');
      expect(uri.queryParameters.containsKey('am'), isFalse,
          reason: 'No fixed amount parameter must be set for flexible payment');
    });

    test('Payment asset files exist and are intact', () {
      expect(File('assets/payments/upigpay.jpeg').existsSync(), isTrue);
      expect(File('assets/payments/phoneupi.jpeg').existsSync(), isTrue);
    });
  });

  group('Sponsorship Dialog Widget Tests', () {
    testWidgets('Renders dual UPI payment options and details',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          home: const Scaffold(
            body: SponsorshipDialog(),
          ),
        ),
      );

      // Verify header and branding
      expect(find.text('Support Forge'), findsOneWidget);
      expect(find.text('by Lokesh'), findsOneWidget);
      expect(find.textContaining('Forge is built with passion'), findsOneWidget);

      // Verify both method tabs exist
      expect(find.text('Google Pay'), findsOneWidget);
      expect(find.text('PhonePe'), findsOneWidget);

      // Verify initial selected method (Google Pay)
      expect(find.text('mr.mlokesh7@oksbi'), findsOneWidget);
      expect(find.text('Payee: M Lokesh'), findsOneWidget);

      // Verify action buttons
      expect(find.text('Pay with Google Pay'), findsOneWidget);
      expect(find.text('Copy Details'), findsOneWidget);
      expect(find.textContaining('Flexible amount'), findsOneWidget);

      // Switch to PhonePe
      await tester.tap(find.text('PhonePe'));
      await tester.pumpAndSettle();

      // Verify PhonePe details and button
      expect(find.text('7603883879@axl'), findsOneWidget);
      expect(find.text('Payee: LOKESH M'), findsOneWidget);
      expect(find.text('Pay with PhonePe'), findsOneWidget);
    });

    testWidgets('Opens enlarged QR modal when tapping on QR preview',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          home: const Scaffold(
            body: SponsorshipDialog(),
          ),
        ),
      );

      // Tap on QR preview area
      await tester.tap(find.text('Tap to enlarge QR code'));
      await tester.pumpAndSettle();

      // Check enlarged QR dialog
      expect(find.text('Google Pay QR'), findsOneWidget);
      expect(find.text('UPI ID: mr.mlokesh7@oksbi'), findsOneWidget);

      // Close enlarged QR dialog
      await tester.tap(find.byTooltip('Close').last);
      await tester.pumpAndSettle();
      expect(find.text('Google Pay QR'), findsNothing);
    });

    testWidgets('Supports mobile viewport dimensions without overflow',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390 * 2, 844 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          home: const Scaffold(
            body: SponsorshipDialog(),
          ),
        ),
      );

      expect(find.text('Support Forge'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
        'Tapping Sponsor button opens SponsorshipDialog with root navigator',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () => showSponsorshipDialog(context),
                  child: const Text('Sponsor the project'),
                );
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('Sponsor the project'));
      await tester.pumpAndSettle();

      expect(find.byType(SponsorshipDialog), findsOneWidget);
      expect(find.text('Support Forge'), findsOneWidget);
      expect(find.text('Google Pay'), findsOneWidget);
      expect(find.text('PhonePe'), findsOneWidget);
    });
  });
}
