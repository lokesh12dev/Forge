import 'package:flutter/material.dart';

/// Forge's signature sporty green.
const Color forgeGreen = Color(0xFF1DB954);

/// The Forge wordmark: the heavy, tight-tracked "Forge" name on its own.
///
/// It owns its own [Material] and [DefaultTextStyle], so it renders cleanly
/// anywhere (custom title bars, app bars, hero sections) without the yellow
/// double underline Flutter draws for text that has no Material ancestor.
class ForgeWordmark extends StatelessWidget {
  const ForgeWordmark({
    this.scale = 1,
    super.key,
  });

  /// 1.0 is sized for a 60px bar. Use ~2.0 for hero placements.
  final double scale;

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: DefaultTextStyle(
        style: const TextStyle(decoration: TextDecoration.none),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Forge',
              style: TextStyle(
                color: forgeGreen,
                fontFamily: 'paytoneOne',
                fontSize: 22 * scale,
                height: 1.0,
                letterSpacing: -1.1 * scale,
                decoration: TextDecoration.none,
              ),
            ),
          ],
        ),
      ),
    );
  }
}