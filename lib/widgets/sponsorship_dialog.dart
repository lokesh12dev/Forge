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

import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/services.dart';
import 'package:forge/constants/payment_constants.dart';
import 'package:forge/utilities/platform_utils.dart';
import 'package:forge/utilities/url_launcher.dart' as forge_launcher;
import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens the dedicated Forge Sponsorship dialog.
Future<void> showSponsorshipDialog(
  BuildContext context, {
  bool autoLaunchPayment = false,
}) {
  return showDialog<void>(
    context: context,
    // ignore: avoid_redundant_argument_values
    useRootNavigator:
        true, // Required: ensures dialog renders above NavShell/MiniPlayer
    builder: (BuildContext dialogContext) =>
        SponsorshipDialog(autoLaunchPayment: autoLaunchPayment),
  );
}

class SponsorshipDialog extends StatefulWidget {
  const SponsorshipDialog({super.key, this.autoLaunchPayment = false});

  final bool autoLaunchPayment;

  @override
  State<SponsorshipDialog> createState() => _SponsorshipDialogState();
}

class _SponsorshipDialogState extends State<SponsorshipDialog> {
  int _selectedMethodIndex = 0;
  String? _statusMessage;
  bool _isErrorMessage = false;

  UpiPaymentMethod get _selectedMethod =>
      SponsorshipConfig.methods[_selectedMethodIndex];

  @override
  void initState() {
    super.initState();
    if (widget.autoLaunchPayment) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _openUpiApp();
      });
    }
  }

  Future<void> _copyToClipboard(String text, String label) async {
    try {
      await Clipboard.setData(ClipboardData(text: text));
      if (!mounted) return;
      setState(() {
        _statusMessage = 'Copied $label to clipboard!';
        _isErrorMessage = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Copied $label to clipboard: $text'),
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _statusMessage = 'Could not copy to clipboard.';
        _isErrorMessage = true;
      });
    }
  }

  Future<void> _openUpiApp() async {
    if (!isMobilePlatform) {
      try {
        await forge_launcher.launchURL(
          Uri.parse(SponsorshipConfig.paymentPortalUrl),
        );
      } catch (_) {}
      if (mounted) {
        setState(() {
          _statusMessage = 'Forge Pay opened in your browser.';
          _isErrorMessage = false;
        });
      }
      return;
    }

    final uri = _selectedMethod.paymentUri;
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (launched) {
        if (!mounted) return;
        setState(() {
          _statusMessage =
              'UPI app opened. Confirm the payee and amount before paying.';
          _isErrorMessage = false;
        });
        return;
      }
    } catch (_) {
      // Intent launch failed or unsupported on this platform (e.g. desktop)
    }

    // Emulators and devices without a UPI app still need a working payment
    // route. Keep the QR in the dialog and open Forge Pay in the browser.
    var portalLaunched = false;
    try {
      portalLaunched = await launchUrl(
        Uri.parse(SponsorshipConfig.paymentPortalUrl),
        mode: LaunchMode.externalApplication,
      );
    } catch (_) {}

    if (!mounted) return;
    setState(() {
      _statusMessage = portalLaunched
          ? 'No UPI app was found. Forge Pay opened in your browser.'
          : SponsorshipConfig.failedOpenAppMessage;
      _isErrorMessage = false;
    });
  }

  void _showEnlargedQr(BuildContext context, UpiPaymentMethod method) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Theme.of(context).colorScheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440, maxHeight: 600),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.qr_code_2,
                            color: Color(0xFF19E28A),
                            size: 26,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${method.title} QR',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(ctx).pop(),
                        tooltip: 'Close',
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Flexible(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: _buildQrImage(method),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'UPI ID: ${method.upiId}',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Payee: ${method.payeeName}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () {
                      _copyToClipboard(method.upiId, 'UPI ID');
                    },
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Copy UPI ID'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildQrImage(UpiPaymentMethod method) {
    return Image.asset(
      method.assetPath,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) => Container(
        height: 180,
        width: 180,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.black26,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.broken_image, size: 40, color: Colors.grey),
            const SizedBox(height: 8),
            const Text(
              'QR Image not loaded',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              method.upiId,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final method = _selectedMethod;

    return Dialog(
      backgroundColor: colorScheme.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: colorScheme.outlineVariant.withValues(alpha: 0.3),
        ),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 540, maxHeight: 720),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF19E28A).withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFF19E28A),
                        width: 1.5,
                      ),
                    ),
                    child: const Center(
                      child: Icon(
                        FluentIcons.heart_24_filled,
                        color: Color(0xFF19E28A),
                        size: 22,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 8,
                          runSpacing: 4,
                          children: [
                            Text(
                              SponsorshipConfig.heading,
                              style: TextStyle(
                                color: colorScheme.onSurface,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                letterSpacing: -0.2,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF19E28A)
                                    .withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Free',
                                style: TextStyle(
                                  color: Color(0xFF19E28A),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          SponsorshipConfig.description,
                          style: TextStyle(
                            color: colorScheme.onSurfaceVariant,
                            fontSize: 13,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    iconSize: 20,
                    splashRadius: 20,
                    tooltip: 'Close',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // Payment Method Selector Tabs
              Container(
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest.withValues(
                    alpha: 0.45,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: colorScheme.outlineVariant.withValues(alpha: 0.2),
                  ),
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  children: List.generate(SponsorshipConfig.methods.length, (
                    index,
                  ) {
                    final isSelected = index == _selectedMethodIndex;
                    final m = SponsorshipConfig.methods[index];
                    return Expanded(
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _selectedMethodIndex = index;
                            _statusMessage = null;
                          });
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF19E28A)
                                      .withValues(alpha: 0.18)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            border: isSelected
                                ? Border.all(
                                    color: const Color(0xFF19E28A),
                                    width: 1.5,
                                  )
                                : Border.all(color: Colors.transparent),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                m.type == UpiPaymentMethodType.googlePay
                                    ? Icons.account_balance_wallet_outlined
                                    : Icons.qr_code_scanner,
                                size: 18,
                                color: isSelected
                                    ? const Color(0xFF19E28A)
                                    : colorScheme.onSurfaceVariant,
                              ),
                              const SizedBox(width: 6),
                              Flexible(
                                child: Text(
                                  m.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: isSelected
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: isSelected
                                        ? colorScheme.onSurface
                                        : colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),

              const SizedBox(height: 16),

              // Selected Method Card
              Container(
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHigh.withValues(
                    alpha: 0.35,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: colorScheme.outlineVariant.withValues(alpha: 0.25),
                  ),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // QR Code Display with Tap to Enlarge
                    GestureDetector(
                      onTap: () => _showEnlargedQr(context, method),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.black26,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: colorScheme.outlineVariant.withValues(
                              alpha: 0.2,
                            ),
                          ),
                        ),
                        child: Column(
                          children: [
                            ConstrainedBox(
                              constraints: const BoxConstraints(
                                maxHeight: 210,
                                maxWidth: 210,
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: _buildQrImage(method),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              alignment: WrapAlignment.center,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Icon(
                                  Icons.zoom_in,
                                  size: 16,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Tap to enlarge QR code',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: colorScheme.primary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Method description
                    Text(
                      method.subtitle,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Payee & UPI ID Box
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: colorScheme.surfaceContainerHighest.withValues(
                          alpha: 0.6,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: colorScheme.outlineVariant.withValues(
                            alpha: 0.2,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Payee: ${method.payeeName}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                SelectableText(
                                  method.upiId,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: colorScheme.onSurface,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 18),
                            tooltip: 'Copy UPI ID',
                            splashRadius: 20,
                            color: const Color(0xFF19E28A),
                            onPressed: () =>
                                _copyToClipboard(method.upiId, 'UPI ID'),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Flexible Amount Notice
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          FluentIcons.sparkle_24_regular,
                          size: 14,
                          color: Color(0xFF19E28A),
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            'Flexible amount · Enter any contribution you choose',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _copyToClipboard(
                        method.paymentDetails,
                        'Payment Details',
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        side: BorderSide(
                          color: colorScheme.outlineVariant.withValues(
                            alpha: 0.5,
                          ),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.copy_all, size: 18),
                      label: const Text(
                        'Copy Details',
                        style: TextStyle(fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: FilledButton.icon(
                      onPressed: _openUpiApp,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF19E28A),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(
                        FluentIcons.open_24_filled,
                        size: 18,
                        color: Colors.black,
                      ),
                      label: Text(
                        isMobilePlatform ? 'Open UPI app' : 'Open Forge Pay',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Feedback / Status Banner
              if (_statusMessage != null) ...[
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: _isErrorMessage
                        ? colorScheme.errorContainer.withValues(alpha: 0.3)
                        : const Color(0xFF19E28A).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _isErrorMessage
                          ? colorScheme.error.withValues(alpha: 0.5)
                          : const Color(0xFF19E28A).withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isErrorMessage
                            ? Icons.info_outline
                            : Icons.check_circle_outline,
                        size: 18,
                        color: _isErrorMessage
                            ? colorScheme.error
                            : const Color(0xFF19E28A),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _statusMessage!,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: _isErrorMessage
                                ? colorScheme.onErrorContainer
                                : colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
