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

import '../widgets/forge_wordmark.dart';
import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:forge/constants/app_constants.dart';
import 'package:forge/constants/version.dart';
import 'package:forge/extensions/l10n.dart';
import 'package:forge/utilities/url_launcher.dart';
import 'package:forge/widgets/mini_player_bottom_space.dart';
import 'package:material_ui/material_ui.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(context.l10n?.about ?? 'About Forge'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: commonSingleChildScrollViewPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const SizedBox(height: 16),

            // Forge by Lokesh Hero Header
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: const Color(0xFFC8F56A).withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFC8F56A),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFC8F56A).withValues(alpha: 0.3),
                          blurRadius: 18,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(
                        FluentIcons.music_note_2_24_filled,
                        size: 36,
                        color: Color(0xFFC8F56A),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const ForgeWordmark(scale: 2.2),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: colorScheme.outlineVariant.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Text(
                      'v$appVersion · Official Release',
                      style: TextStyle(
                        color: colorScheme.onSurfaceVariant,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Profile Card (Lokesh) with Visible High-Contrast Action Buttons
            const _ProfileCard(
              name: 'Lokesh',
              role: 'Lead Creator & Software Engineer',
              avatarUrl: 'https://avatars.githubusercontent.com/lokesh12dev',
              portfolioUrl: 'https://lokesh-online-three.vercel.app/pro',
              githubUrl: 'https://github.com/lokesh12dev',
            ),

            const SizedBox(height: 20),

            // Section: About Me
            _SectionContainer(
              icon: FluentIcons.person_24_filled,
              iconColor: const Color(0xFFC8F56A),
              title: 'About Me',
              child: Text(
                'I am Lokesh, a passionate software developer and creator dedicated to building fast, elegant, and user-centric digital experiences. Forge was conceptualized, designed, and engineered entirely by me from the ground up as a premier, high-fidelity music streaming and library player. Driven by a deep love for music and modern software craft, I created Forge to give listeners an ad-free, smooth, and immersive sound experience across Android, macOS, and Windows. Every feature—from the native low-latency audio engine to the responsive desktop interface and real-time synchronized lyrics—reflects my commitment to clean architecture and uncompromising quality.',
                style: TextStyle(
                  color: colorScheme.onSurface.withValues(alpha: 0.9),
                  fontSize: 14,
                  height: 1.6,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Section: Build Up Myself
            _SectionContainer(
              icon: FluentIcons.fire_24_filled,
              iconColor: const Color(0xFFE5A00D),
              title: 'Build Up Myself',
              subtitle: 'Hard work, passion & countless hours of dedicated engineering',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Building Forge has been an intense, relentless journey of dedication, passion, and countless hours of deep focus. What started as an ambitious vision evolved through endless nights of debugging complex native audio pipelines, optimizing platform-specific rendering, and solving challenging cross-platform audio hurdles across Linux, macOS, and Windows.\n\nEvery single line of code, every UI animation, every CI/CD workflow, and every asset packaging pipeline was shaped by patience, persistence, and continuous self-learning. All work in this application was designed and engineered by Lokesh, fueled by an uncompromising standard for craft and an enduring belief in building software that people truly love to use.',
                    style: TextStyle(
                      color: colorScheme.onSurface.withValues(alpha: 0.9),
                      fontSize: 14,
                      height: 1.6,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _StatBadge(
                        icon: FluentIcons.timer_24_filled,
                        label: 'Hard Work & Time',
                        sublabel: 'Countless hours spent',
                      ),
                      _StatBadge(
                        icon: FluentIcons.heart_24_filled,
                        label: 'Passion & Craft',
                        sublabel: 'Pure audio dedication',
                      ),
                      _StatBadge(
                        icon: FluentIcons.shield_checkmark_24_filled,
                        label: '100% by Lokesh',
                        sublabel: 'Independently built',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Section: Tools & Programming Languages
            const _SectionContainer(
              icon: FluentIcons.developer_board_24_filled,
              iconColor: Color(0xFF0078D4),
              title: 'Tools & Technologies',
              subtitle: 'Programming languages & tools used by Lokesh to build Forge',
              child: Column(
                children: [
                  _TechItem(
                    name: 'Flutter & Dart',
                    role: 'Cross-platform reactive UI, application architecture, animations & state management',
                    icon: FluentIcons.code_24_filled,
                    badgeColor: Color(0xFF02569B),
                  ),
                  SizedBox(height: 10),
                  _TechItem(
                    name: 'C++ & libmpv',
                    role: 'High-performance native audio backend, low-latency stream decoding & Windows runtime',
                    icon: FluentIcons.desktop_24_filled,
                    badgeColor: Color(0xFF659AD2),
                  ),
                  SizedBox(height: 10),
                  _TechItem(
                    name: 'Swift & Objective-C',
                    role: 'macOS native platform runner, ad-hoc codesigning configuration & macOS entitlements',
                    icon: FluentIcons.laptop_24_filled,
                    badgeColor: Color(0xFFFA7343),
                  ),
                  SizedBox(height: 10),
                  _TechItem(
                    name: 'JavaScript, HTML & CSS',
                    role: 'Official Forge release portal, GitHub Pages automated delivery & Playwright verification',
                    icon: FluentIcons.globe_24_filled,
                    badgeColor: Color(0xFFF7DF1E),
                  ),
                  SizedBox(height: 10),
                  _TechItem(
                    name: 'Python',
                    role: 'Automated desktop binary verification, icon checking & static markup link checking',
                    icon: FluentIcons.document_bullet_list_24_filled,
                    badgeColor: Color(0xFF3776AB),
                  ),
                  SizedBox(height: 10),
                  _TechItem(
                    name: 'GitHub Actions & CI/CD',
                    role: 'Automated multi-platform build matrices, Inno Setup installer packaging & DMG creation',
                    icon: FluentIcons.cloud_24_filled,
                    badgeColor: Color(0xFF2088FF),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Section: Forge by Lokesh Board
            _SectionContainer(
              icon: FluentIcons.sparkle_24_filled,
              iconColor: const Color(0xFFC8F56A),
              title: 'Forge by Lokesh — Experience',
              subtitle: 'Key pillars engineered for listeners',
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 550;
                  final width = isWide
                      ? (constraints.maxWidth - 12) / 2
                      : constraints.maxWidth;

                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _FeaturePillar(
                        width: width,
                        title: 'High-Fidelity Audio',
                        description:
                            'Pure music playback with smart audio caching and zero interruptions.',
                        icon: FluentIcons.speaker_2_24_filled,
                      ),
                      _FeaturePillar(
                        width: width,
                        title: 'Desktop & Mobile Chrome',
                        description:
                            'Tailored navigation, responsive window adaptation and system media controls.',
                        icon: FluentIcons.window_24_filled,
                      ),
                      _FeaturePillar(
                        width: width,
                        title: 'Real-Time Lyrics',
                        description:
                            'Synchronized LRC lyrics that flow in rhythm with every beat of the track.',
                        icon: FluentIcons.text_quote_24_filled,
                      ),
                      _FeaturePillar(
                        width: width,
                        title: 'Local & Offline First',
                        description:
                            'Your playlists, favorites, and downloads reside securely on your own device.',
                        icon: FluentIcons.folder_24_filled,
                      ),
                    ],
                  );
                },
              ),
            ),

            const SizedBox(height: 24),
            const MiniPlayerBottomSpace(),
          ],
        ),
      ),
    );
  }
}

/// Profile card displaying Lokesh with visible high-contrast action buttons.
class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.name,
    required this.role,
    required this.avatarUrl,
    required this.portfolioUrl,
    required this.githubUrl,
  });

  final String name;
  final String role;
  final String avatarUrl;
  final String portfolioUrl;
  final String githubUrl;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Material(
      color: colorScheme.surfaceContainerLow,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: colorScheme.outlineVariant.withValues(alpha: 0.18),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                avatarUrl,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 56,
                  height: 56,
                  color: const Color(0xFFC8F56A),
                  child: const Center(
                    child: Text(
                      'L',
                      style: TextStyle(
                        color: Color(0xFF10120F),
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      color: colorScheme.onSurface,
                      fontWeight: FontWeight.w700,
                      fontSize: 17,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    role,
                    style: TextStyle(
                      color: colorScheme.onSurfaceVariant,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _ActionButton(
                  icon: FluentIcons.globe_24_filled,
                  tooltip: 'Portfolio — Lokesh',
                  backgroundColor: const Color(0xFFC8F56A),
                  iconColor: Color(0xFF10120F),
                  onPressed: () => launchURL(Uri.parse(portfolioUrl)),
                ),
                const SizedBox(width: 10),
                _ActionButton(
                  icon: FluentIcons.code_24_filled,
                  tooltip: 'GitHub — lokesh12dev',
                  backgroundColor: const Color(0xFF24292E),
                  iconColor: Colors.white,
                  onPressed: () => launchURL(Uri.parse(githubUrl)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Action button with distinct, high-contrast, beautiful icon.
class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.tooltip,
    required this.backgroundColor,
    required this.iconColor,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.15),
              ),
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: 22, color: iconColor),
          ),
        ),
      ),
    );
  }
}

/// Section container card for grouping structured info.
class _SectionContainer extends StatelessWidget {
  const _SectionContainer({
    required this.icon,
    required this.iconColor,
    required this.title,
    this.subtitle,
    required this.child,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: colorScheme.outlineVariant.withValues(alpha: 0.16),
        ),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: colorScheme.onSurface,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: TextStyle(
                          color: colorScheme.onSurfaceVariant,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

/// Stat / milestone highlight badge.
class _StatBadge extends StatelessWidget {
  const _StatBadge({
    required this.icon,
    required this.label,
    required this.sublabel,
  });

  final IconData icon;
  final String label;
  final String sublabel;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: colorScheme.outlineVariant.withValues(alpha: 0.16),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: const Color(0xFFC8F56A)),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                sublabel,
                style: TextStyle(
                  color: colorScheme.onSurfaceVariant,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Item showing a tool or programming language used by Lokesh.
class _TechItem extends StatelessWidget {
  const _TechItem({
    required this.name,
    required this.role,
    required this.icon,
    required this.badgeColor,
  });

  final String name;
  final String role;
  final IconData icon;
  final Color badgeColor;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: colorScheme.outlineVariant.withValues(alpha: 0.14),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: badgeColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    color: colorScheme.onSurface,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  role,
                  style: TextStyle(
                    color: colorScheme.onSurfaceVariant,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Feature pillar card in the Forge by Lokesh showcase.
class _FeaturePillar extends StatelessWidget {
  const _FeaturePillar({
    required this.width,
    required this.title,
    required this.description,
    required this.icon,
  });

  final double width;
  final String title;
  final String description;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SizedBox(
      width: width,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerHigh,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: colorScheme.outlineVariant.withValues(alpha: 0.14),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFFC8F56A).withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                FluentIcons.music_note_2_24_filled,
                size: 16,
                color: Color(0xFFC8F56A),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                color: colorScheme.onSurface,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                color: colorScheme.onSurfaceVariant,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
