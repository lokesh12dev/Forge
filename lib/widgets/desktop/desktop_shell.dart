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

import '../forge_wordmark.dart';
import 'package:forge/services/navigation_history.dart';
import 'package:forge/services/router_service.dart';
import 'package:forge/widgets/desktop/desktop_now_playing_bar.dart';
import 'package:forge/widgets/desktop/desktop_sidebar.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

/// Window width from which the Spotify-style desktop chrome replaces the
/// mobile / tablet navigation.
const desktopShellBreakpoint = 900.0;

/// Spotify-style desktop chrome: a library sidebar, a floating rounded main
/// surface with a top bar, and a full-width now-playing bar.
class DesktopShell extends StatelessWidget {
  const DesktopShell({
    required this.navigationShell,
    required this.onDestinationSelected,
    super.key,
  });

  final StatefulNavigationShell navigationShell;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final colorScheme = Theme.of(context).colorScheme;

    return SafeArea(
      bottom: false,
      child: ColoredBox(
        color: colorScheme.surface,
        child: Column(
          children: [
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  DesktopSidebar(
                    currentShellIndex: navigationShell.currentIndex,
                    onDestinationSelected: onDestinationSelected,
                  ),
                  Expanded(
                    child: _MainSurface(
                      navigationShell: navigationShell,
                      mediaQuery: mediaQuery,
                      colorScheme: colorScheme,
                      onSettings: () => onDestinationSelected(3),
                    ),
                  ),
                ],
              ),
            ),
            const DesktopNowPlayingBar(),
          ],
        ),
      ),
    );
  }
}

class _MainSurface extends StatelessWidget {
  const _MainSurface({
    required this.navigationShell,
    required this.mediaQuery,
    required this.colorScheme,
    required this.onSettings,
  });

  final StatefulNavigationShell navigationShell;
  final MediaQueryData mediaQuery;
  final ColorScheme colorScheme;
  final VoidCallback onSettings;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(8, 8, 8, 8),
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(Radius.circular(10)),
        color: colorScheme.surfaceContainerLow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          DesktopTopBar(
            onSettings: onSettings,
            onAbout: () => NavigationManager.router.go('/settings/about'),
          ),
          Expanded(
            child: MediaQuery(
              // Every page gets bottom room for the now-playing bar.
              data: mediaQuery.copyWith(
                padding: mediaQuery.padding.copyWith(
                  bottom: desktopNowPlayingBarHeight,
                ),
              ),
              child: navigationShell,
            ),
          ),
        ],
      ),
    );
  }
}

/// Floating top bar: back / forward history buttons,
/// a centered high-contrast "Forge by Lokesh" brand title, and action shortcuts.
class DesktopTopBar extends StatelessWidget {
  const DesktopTopBar({
    required this.onSettings,
    this.onAbout,
    super.key,
  });

  final VoidCallback onSettings;
  final VoidCallback? onAbout;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerLow,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outlineVariant.withValues(alpha: 0.15),
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListenableBuilder(
        listenable: NavigationHistory.instance,
        builder: (context, _) {
          final history = NavigationHistory.instance;

          return Row(
            children: [
              _ChromeIconButton(
                icon: Icons.chevron_left,
                tooltip: 'Back',
                enabled: history.canBack,
                onPressed: history.back,
              ),
              const SizedBox(width: 8),
              _ChromeIconButton(
                icon: Icons.chevron_right,
                tooltip: 'Forward',
                enabled: history.canForward,
                onPressed: history.forward,
              ),
              const Spacer(),
              _ForgeBrandTitle(
                onTap: onAbout ??
                    () => NavigationManager.router.go('/settings/about'),
              ),
              const Spacer(),
              if (onAbout != null) ...[
                _ChromeIconButton(
                  icon: Icons.info_outline,
                  tooltip: 'About Forge by Lokesh',
                  enabled: true,
                  onPressed: onAbout,
                ),
                const SizedBox(width: 8),
              ],
              _ChromeIconButton(
                icon: Icons.settings,
                tooltip: 'Settings',
                enabled: true,
                onPressed: onSettings,
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Pinned "forge · by Lokesh" brand lockup in the title bar.
class _ForgeBrandTitle extends StatelessWidget {
  const _ForgeBrandTitle({this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Forge by Lokesh — Tap for About & Creator details',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          child: ForgeWordmark(),
        ),
      ),
    );
  }
}

/// Circular chrome button, soft dark circles.
class _ChromeIconButton extends StatelessWidget {
  const _ChromeIconButton({
    required this.icon,
    required this.tooltip,
    required this.enabled,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final bool enabled;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Tooltip(
      message: tooltip,
      waitDuration: const Duration(milliseconds: 600),
      child: Opacity(
        opacity: enabled ? 1 : 0.35,
        child: SizedBox(
          width: 34,
          height: 34,
          child: Material(
            color: colorScheme.surfaceContainer,
            shape: const CircleBorder(),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: enabled ? onPressed : null,
              child: Center(
                child: Icon(
                  icon,
                  size: 18,
                  color: colorScheme.onSurface,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
