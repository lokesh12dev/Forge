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

enum UpiPaymentMethodType {
  googlePay,
  phonePe,
}

class UpiPaymentMethod {
  const UpiPaymentMethod({
    required this.type,
    required this.title,
    required this.subtitle,
    required this.assetPath,
    required this.externalFallbackPath,
    required this.upiId,
    required this.payeeName,
    required this.rawQrUri,
    this.note = 'Support Forge by Lokesh',
  });

  final UpiPaymentMethodType type;
  final String title;
  final String subtitle;
  final String assetPath;
  final String externalFallbackPath;
  final String upiId;
  final String payeeName;
  final String note;
  final String rawQrUri;

  /// Flexible UPI Payment URI without any fixed amount parameter.
  /// Standard format:
  /// upi://pay?pa=ACTUAL_UPI_ID&pn=ACTUAL_PAYEE_NAME&tn=Support%20Forge%20by%20Lokesh&cu=INR
  Uri get paymentUri {
    final encodedPn = Uri.encodeComponent(payeeName);
    final encodedTn = Uri.encodeComponent(note);
    return Uri.parse('upi://pay?pa=$upiId&pn=$encodedPn&tn=$encodedTn&cu=INR');
  }

  /// Full payment details string formatted for easy copying
  String get paymentDetails =>
      'Method: $title\nPayee: $payeeName\nUPI ID: $upiId\nNote: $note\nCurrency: INR (Flexible Amount)';
}

class SponsorshipConfig {
  static const String creatorName = 'Lokesh';
  static const String heading = 'Support Forge';
  static const String description =
      'Forge is built with passion. Your support helps us improve the experience, build new features and keep the project growing.';
  static const String appreciationMessage =
      'Thank you for supporting Forge by Lokesh. Your contribution is appreciated!';
  static const String failedOpenAppMessage =
      'Unable to open a UPI application? Scan the QR code using your preferred UPI app.';

  static const googlePay = UpiPaymentMethod(
    type: UpiPaymentMethodType.googlePay,
    title: 'Google Pay',
    subtitle: 'Scan and pay using Google Pay or any compatible UPI application.',
    assetPath: 'assets/payments/upigpay.jpeg',
    externalFallbackPath: '/Users/m.lokesh/Downloads/upigpay.jpeg',
    upiId: 'mr.mlokesh7@oksbi',
    payeeName: 'M Lokesh',
    rawQrUri: 'upi://pay?pa=mr.mlokesh7@oksbi&pn=M%20Lokesh&aid=uGICAgKDwx_K9bw',
  );

  static const phonePe = UpiPaymentMethod(
    type: UpiPaymentMethodType.phonePe,
    title: 'PhonePe',
    subtitle: 'Scan and pay using PhonePe or any compatible UPI application.',
    assetPath: 'assets/payments/phoneupi.jpeg',
    externalFallbackPath: '/Users/m.lokesh/Downloads/phoneupi.jpeg',
    upiId: '7603883879@axl',
    payeeName: 'LOKESH M',
    rawQrUri: 'upi://pay?pa=7603883879@axl&pn=LOKESH%20%20M&mc=0000&mode=02&purpose=00',
  );

  static const List<UpiPaymentMethod> methods = [
    googlePay,
    phonePe,
  ];
}
