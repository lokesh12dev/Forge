import 'package:flutter/material.dart';

/// Forge's signature sporty green, shared with the website.
const Color forgeGreen = Color(0xFF19E28A);

/// The Forge brand lockup: a glowing ember, the heavy tight-tracked lowercase
/// "forge" wordmark and a spaced "BY LOKESH" signature framed by hairlines.
///
/// It owns its own [Material] and [DefaultTextStyle], so it renders cleanly
/// anywhere (custom title bars, app bars, hero sections) without the yellow
/// double underline Flutter draws for text that has no Material ancestor.
class ForgeWordmark extends StatelessWidget {
  const ForgeWordmark({
    this.scale = 1,
    this.showSignature = true,
    this.inverted = false,
    super.key,
  });

  /// 1.0 is sized for a 60px bar. Use ~2.0 for hero placements.
  final double scale;
  final bool showSignature;

  /// Dark ink on a green bar instead of white/green on a dark surface.
  final bool inverted;

  @override
  Widget build(BuildContext context) {
    const ink = Color(0xFF0A1410);
    const paper = Color(0xFFF4F7F2);
    final wordColor = inverted ? ink : paper;
    final accent = inverted ? ink : forgeGreen;

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
                    color: accent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: accent.withValues(alpha: inverted ? 0.0 : 0.55),
                        blurRadius: 8 * scale,
                        spreadRadius: 1 * scale,
                      ),
                    ],
                  ),
                ),
                Text(
                  'forge',
                  style: TextStyle(
                    color: wordColor,
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
                  _Hairline(scale: scale, fadeLeft: true, color: accent),
                  SizedBox(width: 6 * scale),
                  Text(
                    'BY LOKESH',
                    style: TextStyle(
                      color: accent,
                      fontSize: 8.5 * scale,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.6 * scale,
                      height: 1.0,
                      decoration: TextDecoration.none,
                    ),
                  ),
                  SizedBox(width: 6 * scale),
                  _Hairline(scale: scale, fadeLeft: false, color: accent),
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
  const _Hairline({
    required this.scale,
    required this.fadeLeft,
    required this.color,
  });

  final double scale;
  final bool fadeLeft;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final strong = color.withValues(alpha: 0.7);
    final faint = color.withValues(alpha: 0);
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
