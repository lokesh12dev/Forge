import 'dart:async';

import 'package:forge/constants/payment_constants.dart';
import 'package:forge/extensions/l10n.dart';
import 'package:forge/utilities/platform_utils.dart';
import 'package:forge/utilities/url_launcher.dart';
import 'package:forge/widgets/shapes/four_sided_cookie_shape.dart';
import 'package:forge/widgets/sponsorship_dialog.dart';
import 'package:material_ui/material_ui.dart';

class SponsorProjectCard extends StatelessWidget {
  const SponsorProjectCard({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Material(
      color: colorScheme.primaryContainer,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          final isMobile = isMobilePlatform;
          unawaited(
            showSponsorshipDialog(context, autoLaunchPayment: isMobile),
          );
          if (isDesktopPlatform) {
            unawaited(launchURL(Uri.parse(SponsorshipConfig.paymentPortalUrl)));
          }
        },
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            children: [
              FourSidedCookieShape(
                size: 44,
                color: colorScheme.onPrimaryContainer.withValues(alpha: 0.14),
                child: Icon(
                  Icons.favorite,
                  color: colorScheme.onPrimaryContainer,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.l10n!.sponsorProject,
                      style: TextStyle(
                        color: colorScheme.onPrimaryContainer,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Google Pay, PhonePe & compatible UPI apps',
                      style: TextStyle(
                        color: colorScheme.onPrimaryContainer.withValues(
                          alpha: 0.75,
                        ),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: colorScheme.onPrimaryContainer.withValues(alpha: 0.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
