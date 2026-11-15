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
import 'package:cached_network_image/cached_network_image.dart';
import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter/rendering.dart';
import 'package:forge/constants/app_constants.dart';
import 'package:forge/extensions/l10n.dart';
import 'package:forge/main.dart';
import 'package:forge/services/artist_service.dart' show ytMusicClient;
import 'package:forge/services/common_services.dart';
import 'package:forge/services/listening_stats_service.dart';
import 'package:forge/services/router_service.dart';
import 'package:forge/services/settings_manager.dart';
import 'package:forge/utilities/app_utils.dart';
import 'package:forge/utilities/async_loader.dart';
import 'package:forge/utilities/formatter.dart' show returnSongLayout;
import 'package:forge/utilities/listening_stats_utils.dart';
import 'package:forge/widgets/announcement_box.dart';
import 'package:forge/widgets/desktop/desktop_shell.dart'
    show desktopShellBreakpoint;
import 'package:forge/widgets/listening_recap_card.dart';
import 'package:forge/widgets/mini_player_bottom_space.dart';
import 'package:forge/widgets/recommended_songs_section.dart';
import 'package:forge/widgets/section_header.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  static const _songCategories = <({String title, String query, String key})>[
    (title: 'Tamil Songs', query: 'Tamil songs', key: 'home_tamil_songs'),
    (
      title: 'Tamil Trending Song Recommendations',
      query: 'Tamil trending songs',
      key: 'home_tamil_trending',
    ),
    (
      title: 'Popular English Trending Music',
      query: 'popular English trending music',
      key: 'home_english_trending',
    ),
  ];

  Future<List<dynamic>>? _lastCategorySearch;

  Future<List<dynamic>> _queueCategorySearch(String query) {
    final previous = _lastCategorySearch;
    final future = previous == null
        ? _fetchCategorySongs(query)
        : previous.then((_) => _fetchCategorySongs(query));
    _lastCategorySearch = future;
    return future;
  }

  Future<List> _fetchCategorySongs(String query) async {
    try {
      final videos = await ytMusicClient.music
          .searchSongs(query, limit: 6)
          .timeout(const Duration(seconds: 20));
      return videos
          .asMap()
          .entries
          .map((entry) => returnSongLayout(entry.key, entry.value))
          .toList();
    } catch (error, stackTrace) {
      logger.log(
        'Home music search failed for "$query"',
        error: error,
        stackTrace: stackTrace,
      );
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop =
        MediaQuery.of(context).size.width >= desktopShellBreakpoint;

    return Scaffold(
      appBar: isDesktop
          ? null
          : AppBar(
              title: InkWell(
                onTap: () => context.push('/settings/about'),
                borderRadius: BorderRadius.circular(12),
                child: const ForgeWordmark(),
              ),
              centerTitle: true,
            ),
      body: CustomScrollView(
        scrollCacheExtent: const ScrollCacheExtent.pixels(350),
        slivers: [
          SliverPadding(
            padding: commonSingleChildScrollViewPadding,
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                ValueListenableBuilder<String?>(
                  valueListenable: announcementURL,
                  builder: (_, _url, __) {
                    if (_url == null) return const SizedBox.shrink();
                    final isSponsorshipAnnouncement =
                        isSponsorshipAnnouncementUrl(_url);
                    final _message = isSponsorshipAnnouncement
                        ? context.l10n!.sponsorProject
                        : context.l10n!.newAnnouncement;
                    final _icon = isSponsorshipAnnouncement
                        ? FluentIcons.heart_24_filled
                        : FluentIcons.megaphone_24_filled;

                    return AnnouncementBox(
                      message: _message,
                      url: _url,
                      icon: _icon,
                      onDismiss: () async {
                        announcementURL.value = null;
                      },
                    );
                  },
                ),

                const SizedBox(height: 12),

                // Spotify-Style Top Quick Access Cards
                const _QuickAccessGrid(),

                const SizedBox(height: 20),

                // 1. New release from DJ Javi26 / Sai Abhyankkar
                const _NewReleaseSpotlight(),

                const SizedBox(height: 20),

                // 2. Albums featuring songs you like
                const _AlbumsFeaturingSection(),

                const SizedBox(height: 20),

                // 3. Recents
                const _RecentsSection(),

                const SizedBox(height: 20),

                // 4. Recommended for today
                const _RecommendedTodaySection(),

                const SizedBox(height: 20),

                // 5. Upgraded Trending Songs (Tamil, English)
                ..._songCategories.map(
                  (category) => _SongCategorySection(
                    category: category,
                    loadSongs: _queueCategorySearch,
                  ),
                ),

                _buildCurrentMonthRecapSection(),

                const MiniPlayerBottomSpace(),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentMonthRecapSection() {
    return ValueListenableBuilder<bool>(
      valueListenable: wrappedEnabled,
      builder: (_, isEnabled, __) {
        if (!isEnabled) return const SizedBox.shrink();

        final currentMonthKey = listeningStatsMonthKey(DateTime.now());
        final monthStats = listeningStatsService.monthStats(currentMonthKey);
        final songs = listeningStatsService.monthTopSongs(currentMonthKey);
        final displayMinutes = monthDisplayMinutes(monthStats);
        if (displayMinutes <= 0 && songs.isEmpty) {
          return const SizedBox.shrink();
        }

        final previewSongs = songs.take(wrappedShareSongsLimit).toList();
        final periodLabel = formatMonthPeriodLabel(
          Localizations.localeOf(context),
          currentMonthKey,
        );

        return Column(
          children: [
            SectionHeader(
              title: context.l10n!.timeMachine,
              icon: FluentIcons.data_trending_24_filled,
            ),
            ListeningRecapCard(
              periodLabel: periodLabel,
              minutes: displayMinutes,
              songs: previewSongs,
              onSongTap: (index) => _playRecapSongs(previewSongs, index),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 10, 8, 0),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton.tonalIcon(
                  onPressed: () => context.push('/home/timeMachine'),
                  icon: const Icon(FluentIcons.arrow_right_24_regular),
                  label: Text(context.l10n!.listeningStats),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _playRecapSongs(
    List<Map<String, dynamic>> songs,
    int index,
  ) async {
    if (songs.isEmpty) return;
    await audioHandler.playPlaylistSong(
      playlist: {'title': context.l10n!.timeMachine, 'list': songs},
      songIndex: index,
    );
  }
}

/// Spotify-style quick access chips at the top of the feed.
class _QuickAccessGrid extends StatelessWidget {
  const _QuickAccessGrid();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth > 900
            ? 4
            : constraints.maxWidth > 550
                ? 2
                : 2;
        final cardWidth = (constraints.maxWidth - (count - 1) * 10) / count;

        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            _QuickChip(
              width: cardWidth,
              title: 'Liked Songs',
              gradientColors: const [Color(0xFF450AF5), Color(0xFF8E8CD8)],
              icon: Icons.favorite,
              onTap: () =>
                  NavigationManager.router.go('/library/userSongs/liked'),
            ),
            _QuickChip(
              width: cardWidth,
              title: 'Tamil Hits',
              gradientColors: const [Color(0xFFB02A37), Color(0xFFE5A00D)],
              icon: FluentIcons.music_note_2_24_filled,
              onTap: () =>
                  NavigationManager.router.go('/search?q=Tamil+trending+songs'),
            ),
            _QuickChip(
              width: cardWidth,
              title: 'Trending Global',
              gradientColors: const [Color(0xFF1E3264), Color(0xFFC8F56A)],
              icon: FluentIcons.sparkle_24_filled,
              onTap: () => NavigationManager.router
                  .go('/search?q=popular+English+trending+music'),
            ),
            _QuickChip(
              width: cardWidth,
              title: 'Offline Songs',
              gradientColors: const [Color(0xFF0F5132), Color(0xFF71B280)],
              icon: FluentIcons.arrow_download_24_filled,
              onTap: () =>
                  NavigationManager.router.go('/library/userSongs/offline'),
            ),
          ],
        );
      },
    );
  }
}

class _QuickChip extends StatefulWidget {
  const _QuickChip({
    required this.width,
    required this.title,
    required this.gradientColors,
    required this.icon,
    required this.onTap,
  });

  final double width;
  final String title;
  final List<Color> gradientColors;
  final IconData icon;
  final VoidCallback onTap;

  @override
  State<_QuickChip> createState() => _QuickChipState();
}

class _QuickChipState extends State<_QuickChip> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Material(
        color: _isHovered
            ? colorScheme.surfaceContainerHigh
            : colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(6),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: widget.onTap,
          child: SizedBox(
            width: widget.width,
            height: 54,
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: widget.gradientColors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Icon(widget.icon, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    widget.title,
                    style: TextStyle(
                      color: colorScheme.onSurface,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (_isHovered) ...[
                  Container(
                    width: 32,
                    height: 32,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: const BoxDecoration(
                      color: Color(0xFFC8F56A),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x40000000),
                          blurRadius: 6,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.play_arrow,
                      color: Colors.black,
                      size: 20,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 1. Spotify Spotlight Card: "New release from <Artist>"
class _NewReleaseSpotlight extends StatefulWidget {
  const _NewReleaseSpotlight();

  @override
  State<_NewReleaseSpotlight> createState() => _NewReleaseSpotlightState();
}

class _NewReleaseSpotlightState extends State<_NewReleaseSpotlight> {
  bool _isPlaying = false;

  Future<void> _playFeaturedRelease() async {
    setState(() => _isPlaying = true);
    try {
      final songs = await fetchSongsList(
        'Radhimaa From Think Indie Sai Abhyankkar',
      );
      if (songs.isNotEmpty) {
        await audioHandler.playPlaylistSong(
          playlist: {
            'title': 'New release from Sai Abhyankkar',
            'list': songs,
          },
          songIndex: 0,
        );
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isPlaying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                image: DecorationImage(
                  image: NetworkImage(
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'NEW RELEASE FROM',
                  style: TextStyle(
                    color: colorScheme.onSurfaceVariant,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                Text(
                  'Sai Abhyankkar & Nargis Teji',
                  style: TextStyle(
                    color: colorScheme.onSurface,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        Material(
          color: colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(10),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: _playFeaturedRelease,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: colorScheme.outlineVariant.withValues(alpha: 0.12),
                ),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CachedNetworkImage(
                      imageUrl:
                          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&auto=format&fit=crop&q=80',
                      width: 110,
                      height: 110,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        width: 110,
                        height: 110,
                        color: const Color(0xFFC8F56A),
                        child: const Icon(Icons.album, color: Color(0xFF10120F), size: 40),
                      ),
                    ),
                  ),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SINGLE · THINK INDIE',
                          style: TextStyle(
                            color: colorScheme.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Radhimaa (From "Think Indie")',
                          style: TextStyle(
                            color: colorScheme.onSurface,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Sai Abhyankkar, Nargis Teji, Asma Teji & Vivek',
                          style: TextStyle(
                            color: colorScheme.onSurfaceVariant,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: const BoxDecoration(
                                color: Color(0xFFC8F56A),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(0x66C8F56A),
                                    blurRadius: 8,
                                    offset: Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: _isPlaying
                                  ? const Center(
                                      child: SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.black,
                                        ),
                                      ),
                                    )
                                  : const Icon(
                                      Icons.play_arrow,
                                      color: Colors.black,
                                      size: 22,
                                    ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Play Track',
                              style: TextStyle(
                                color: colorScheme.onSurface,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// 2. Spotify Section: "Albums featuring songs you like"
class _AlbumsFeaturingSection extends StatelessWidget {
  const _AlbumsFeaturingSection();

  static const _albums = [
    (
      title: 'SURFISTINHA',
      artist: 'Dj Shazam Beat, DJ David MM',
      cover:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=320&auto=format&fit=crop&q=80',
      query: 'SURFISTINHA Dj Shazam Beat',
    ),
    (
      title: 'FUNK MADA',
      artist: 'ICEDMANE, DYSMANE',
      cover:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=320&auto=format&fit=crop&q=80',
      query: 'FUNK MADA ICEDMANE',
    ),
    (
      title: 'MONTAGEM OSCURIDA',
      artist: 'RVNGE, Dhruv Vajasi',
      cover:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=320&auto=format&fit=crop&q=80',
      query: 'MONTAGEM OSCURIDA RVNGE',
    ),
    (
      title: 'Aasa Kooda',
      artist: 'Sai Abhyankkar, Sai Smriti',
      cover:
          'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=320&auto=format&fit=crop&q=80',
      query: 'Aasa Kooda Sai Abhyankkar',
    ),
    (
      title: 'Hukum (Jailer)',
      artist: 'Anirudh Ravichander',
      cover:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&auto=format&fit=crop&q=80',
      query: 'Hukum Jailer Anirudh Ravichander',
    ),
    (
      title: 'After Hours',
      artist: 'The Weeknd',
      cover:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&auto=format&fit=crop&q=80',
      query: 'The Weeknd After Hours',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeaderBar(
          title: 'Albums featuring songs you like',
          onShowAll: () =>
              NavigationManager.router.go('/search?q=trending+albums'),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 228,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _albums.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final album = _albums[index];
              return _SpotifyAlbumCard(
                title: album.title,
                artist: album.artist,
                imageUrl: album.cover,
                onTap: () async {
                  final songs = await fetchSongsList(album.query);
                  if (songs.isNotEmpty) {
                    await audioHandler.playPlaylistSong(
                      playlist: {'title': album.title, 'list': songs},
                      songIndex: 0,
                    );
                  }
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

/// 3. Spotify Section: "Recents"
class _RecentsSection extends StatelessWidget {
  const _RecentsSection();

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List>(
      valueListenable: userRecentlyPlayed,
      builder: (context, recentSongs, _) {
        final hasRecents = recentSongs.isNotEmpty;
        final previewList = hasRecents
            ? recentSongs.take(8).toList()
            : [
                {
                  'title': 'Radhimaa',
                  'artist': 'Sai Abhyankkar',
                  'image':
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&auto=format&fit=crop&q=80',
                  'query': 'Radhimaa Sai Abhyankkar',
                },
                {
                  'title': 'SURFISTINHA',
                  'artist': 'Dj Shazam Beat',
                  'image':
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=320&auto=format&fit=crop&q=80',
                  'query': 'SURFISTINHA',
                },
                {
                  'title': 'FUNK MADA',
                  'artist': 'ICEDMANE',
                  'image':
                      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=320&auto=format&fit=crop&q=80',
                  'query': 'FUNK MADA',
                },
                {
                  'title': 'Aasa Kooda',
                  'artist': 'Sai Abhyankkar',
                  'image':
                      'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=320&auto=format&fit=crop&q=80',
                  'query': 'Aasa Kooda',
                },
              ];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SectionHeaderBar(
              title: 'Recents',
              onShowAll: () =>
                  NavigationManager.router.go('/library/userSongs/recent'),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 228,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: previewList.length,
                separatorBuilder: (_, __) => const SizedBox(width: 14),
                itemBuilder: (context, index) {
                  final item = previewList[index] as Map;
                  final title = item['title']?.toString() ?? 'Track';
                  final artist = item['artist']?.toString() ?? 'Artist';
                  final image = item['image']?.toString() ??
                      item['lowResImage']?.toString() ??
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=320&auto=format&fit=crop&q=80';

                  return _SpotifyAlbumCard(
                    title: title,
                    artist: artist,
                    imageUrl: image,
                    onTap: () async {
                      if (hasRecents) {
                        await audioHandler.playPlaylistSong(
                          playlist: {'title': 'Recents', 'list': recentSongs},
                          songIndex: index,
                        );
                      } else {
                        final songs = await fetchSongsList(
                          item['query']?.toString() ?? title,
                        );
                        if (songs.isNotEmpty) {
                          await audioHandler.playPlaylistSong(
                            playlist: {'title': title, 'list': songs},
                            songIndex: 0,
                          );
                        }
                      }
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

/// 4. Spotify Section: "Recommended for today"
class _RecommendedTodaySection extends StatelessWidget {
  const _RecommendedTodaySection();

  static const _mixes = [
    (
      title: 'Tamil Acoustic & Indie',
      artist: 'Pradeep Kumar, Sean Roldan, Sid Sriram',
      cover:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&auto=format&fit=crop&q=80',
      query: 'Tamil acoustic indie songs',
    ),
    (
      title: 'High-Energy Funk & Phonk',
      artist: 'KSLV, KPHK, RVNGE, ICEDMANE',
      cover:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=320&auto=format&fit=crop&q=80',
      query: 'funk phonk bass playlist',
    ),
    (
      title: 'Anirudh High Voltage',
      artist: 'Anirudh Ravichander, Jonita Gandhi',
      cover:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=320&auto=format&fit=crop&q=80',
      query: 'Anirudh Ravichander best trending hits',
    ),
    (
      title: 'Late Night Chill Vibes',
      artist: 'Lo-Fi, Synthwave, Ambient Grooves',
      cover:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=320&auto=format&fit=crop&q=80',
      query: 'chill late night beats playlist',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeaderBar(
          title: 'Recommended for today',
          onShowAll: () =>
              NavigationManager.router.go('/search?q=recommended+today'),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 228,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _mixes.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final mix = _mixes[index];
              return _SpotifyAlbumCard(
                title: mix.title,
                artist: mix.artist,
                imageUrl: mix.cover,
                onTap: () async {
                  final songs = await fetchSongsList(mix.query);
                  if (songs.isNotEmpty) {
                    await audioHandler.playPlaylistSong(
                      playlist: {'title': mix.title, 'list': songs},
                      songIndex: 0,
                    );
                  }
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Spotify-style individual card with cover texture and hover play button.
class _SpotifyAlbumCard extends StatefulWidget {
  const _SpotifyAlbumCard({
    required this.title,
    required this.artist,
    required this.imageUrl,
    required this.onTap,
  });

  final String title;
  final String artist;
  final String imageUrl;
  final VoidCallback onTap;

  @override
  State<_SpotifyAlbumCard> createState() => _SpotifyAlbumCardState();
}

class _SpotifyAlbumCardState extends State<_SpotifyAlbumCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Material(
        color: _isHovered
            ? colorScheme.surfaceContainerHigh
            : colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(8),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: widget.onTap,
          child: Container(
            width: 156,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colorScheme.outlineVariant.withValues(alpha: 0.1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: CachedNetworkImage(
                        imageUrl: widget.imageUrl,
                        width: 132,
                        height: 132,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 132,
                          height: 132,
                          color: const Color(0xFF282828),
                          child: const Icon(
                            Icons.album,
                            color: Colors.white54,
                            size: 40,
                          ),
                        ),
                      ),
                    ),
                    if (_isHovered) ...[
                      Positioned(
                        right: 8,
                        bottom: 8,
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            color: Color(0xFFC8F56A),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0x66000000),
                                blurRadius: 8,
                                offset: Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.play_arrow,
                            color: Colors.black,
                            size: 24,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  widget.title,
                  style: TextStyle(
                    color: colorScheme.onSurface,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Text(
                  widget.artist,
                  style: TextStyle(
                    color: colorScheme.onSurfaceVariant,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Header bar with title and "Show all" action button matching Spotify.
class _SectionHeaderBar extends StatelessWidget {
  const _SectionHeaderBar({
    required this.title,
    this.onShowAll,
  });

  final String title;
  final VoidCallback? onShowAll;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.4,
          ),
        ),
        if (onShowAll != null) ...[
          TextButton(
            onPressed: onShowAll,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              'Show all',
              style: TextStyle(
                color: colorScheme.onSurfaceVariant,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _SongCategorySection extends StatefulWidget {
  const _SongCategorySection({required this.category, required this.loadSongs});

  final ({String title, String query, String key}) category;
  final Future<List<dynamic>> Function(String query) loadSongs;

  @override
  State<_SongCategorySection> createState() => _SongCategorySectionState();
}

class _SongCategorySectionState extends State<_SongCategorySection> {
  late final Future<List<dynamic>> _songs;

  @override
  void initState() {
    super.initState();
    _songs = widget.loadSongs(widget.category.query);
  }

  @override
  Widget build(BuildContext context) {
    final category = widget.category;
    return AsyncLoader<List<dynamic>>(
      future: _songs,
      loadingWidget: Column(
        children: [
          SectionHeader(
            title: category.title,
            icon: FluentIcons.sparkle_24_filled,
          ),
          const SizedBox(height: 64),
        ],
      ),
      emptyWidget: SectionHeader(
        title: category.title,
        icon: FluentIcons.sparkle_24_filled,
      ),
      builder: (context, songs) => RecommendedSongsSection(
        title: category.title,
        songs: songs,
        listKeyPrefix: category.key,
      ),
    );
  }
}
