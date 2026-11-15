import 'package:flutter/material.dart';

/// Forge's signature electric lime, shared with the website.
const Color forgeLime = Color(0xFFC8F56A);

/// The Forge brand lockup: a glowing ember, the heavy tight-tracked lowercase
/// "forge" wordmark and a spaced "BY LOKESH" signature framed by hairlines.
///
/// It owns its own [Material] and [DefaultTextStyle], so it renders cleanly
/// anywhere (custom title bars, app bars, hero sections) without the yellow
/// double underline Flutter draws for text that has no Material ancestor.
class ForgeWordmark extends StatelessWidget {
  const ForgeWordmark({this.scale = 1.0, this.showSignature = true, super.key});

  /// 1.0 is sized for a 60px bar. Use ~2.0 for hero placements.
  final double scale;
  final bool showSignature;

  @override
  Widget build(BuildContext context) {
    final onSurface = Theme.of(context).colorScheme.onSurface;

    return Material(
      type: MaterialType.transparency,
      child: DefaultTextStyle(
        style: const TextStyle(decoration: TextDecoration.none),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 7 * scale,
                  height: 7 * scale,
                  margin: EdgeInsets.only(right: 7 * scale, top: 2 * scale),
                  decoration: BoxDecoration(
                    color: forgeLime,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: forgeLime.withValues(alpha: 0.55),
                        blurRadius: 8 * scale,
                        spreadRadius: 1 * scale,
                      ),
                    ],
                  ),
                ),
                Text(
                  'forge',
                  style: TextStyle(
                    color: onSurface,
                    fontFamily: 'paytoneOne',
                    fontSize: 22 * scale,
                    height: 1.0,
                    letterSpacing: -1.1 * scale,
                    decoration: TextDecoration.none,
                  ),
                ),
              ],
            ),
            if (showSignature) ...[
              SizedBox(height: 3 * scale),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _Hairline(scale: scale, fadeLeft: true),
                  SizedBox(width: 6 * scale),
                  Text(
                    'BY LOKESH',
                    style: TextStyle(
                      color: forgeLime,
                      fontSize: 8.5 * scale,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.6 * scale,
                      height: 1.0,
                      decoration: TextDecoration.none,
                    ),
                  ),
                  SizedBox(width: 6 * scale),
                  _Hairline(scale: scale, fadeLeft: false),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Hairline extends StatelessWidget {
  const _Hairline({required this.scale, required this.fadeLeft});

  final double scale;
  final bool fadeLeft;

  @override
  Widget build(BuildContext context) {
    final strong = forgeLime.withValues(alpha: 0.7);
    final faint = forgeLime.withValues(alpha: 0.0);
    return Container(
      width: 16 * scale,
      height: 1,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: fadeLeft ? [faint, strong] : [strong, faint],
        ),
      ),
    );
  }
}
